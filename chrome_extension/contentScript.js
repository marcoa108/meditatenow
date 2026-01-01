// Responsibilities:
// - Detect supported iframes: YouTube, Vimeo, SoundCloud
// - Inject the page-world YouTube bridge (Upgrade B)
// - Provide a unified API to the Side Panel via chrome.runtime messages
// - Track currentTime state per player (Vimeo/SC via postMessage; YouTube via bridge)

const PROVIDER = {
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo',
  SOUNDCLOUD: 'soundcloud'
};

const BRIDGE_TAG = 'MEDIA_NOTES_BRIDGE';

function injectYouTubeBridgeOnce() {
  if (window.__mncBridgeInjected) return;
  window.__mncBridgeInjected = true;

  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('injectedBridge.js');
  s.async = false;
  (document.documentElement || document.head).appendChild(s);
  s.addEventListener('load', () => s.remove());
}

injectYouTubeBridgeOnce();

function isYouTubeIframe(iframe) {
  const src = iframe.src || '';
  return /youtube\.com\/embed\//i.test(src) || /youtube-nocookie\.com\/embed\//i.test(src);
}

function isVimeoIframe(iframe) {
  const src = iframe.src || '';
  return /player\.vimeo\.com\/video\//i.test(src);
}

function isSoundCloudIframe(iframe) {
  const src = iframe.src || '';
  return /w\.soundcloud\.com\/player\//i.test(src);
}

function detectPlayers() {
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const players = [];

  for (const iframe of iframes) {
    if (!iframe.contentWindow) continue;

    if (isYouTubeIframe(iframe)) {
      players.push({ provider: PROVIDER.YOUTUBE, src: iframe.src, el: iframe });
    } else if (isVimeoIframe(iframe)) {
      players.push({ provider: PROVIDER.VIMEO, src: iframe.src, el: iframe });
    } else if (isSoundCloudIframe(iframe)) {
      players.push({ provider: PROVIDER.SOUNDCLOUD, src: iframe.src, el: iframe });
    }
  }

  return players;
}

let cachedPlayers = detectPlayers();

const mo = new MutationObserver(() => {
  cachedPlayers = detectPlayers();
});
mo.observe(document.documentElement, { childList: true, subtree: true });

// ---- provider message helpers ----
function vimeoPost(player, method, value) {
  const payload = { method };
  if (typeof value !== 'undefined') payload.value = value;
  player.el.contentWindow.postMessage(payload, '*');
}

function scPost(player, method, value) {
  const payload = { method, value };
  player.el.contentWindow.postMessage(JSON.stringify(payload), '*');
}

function providerPlay(player) {
	setPlaying(player, true);
  if (player.provider === PROVIDER.YOUTUBE) bridgeCmd(player, 'PLAY');
  if (player.provider === PROVIDER.VIMEO) vimeoPost(player, 'play');
  if (player.provider === PROVIDER.SOUNDCLOUD) scPost(player, 'play');
}

function providerPause(player) {
  setPlaying(player, false);
	if (player.provider === PROVIDER.YOUTUBE) bridgeCmd(player, 'PAUSE');
  if (player.provider === PROVIDER.VIMEO) vimeoPost(player, 'pause');
  if (player.provider === PROVIDER.SOUNDCLOUD) scPost(player, 'pause');
}

function providerSeek(player, seconds) {
  if (player.provider === PROVIDER.YOUTUBE) bridgeCmd(player, 'SEEK', seconds);
  if (player.provider === PROVIDER.VIMEO) vimeoPost(player, 'setCurrentTime', seconds);
  if (player.provider === PROVIDER.SOUNDCLOUD) scPost(player, 'seekTo', Math.max(0, seconds * 1000));
}

function requestCurrentTime(player) {
  if (player.provider === PROVIDER.YOUTUBE) bridgeCmd(player, 'GET_TIME');
  if (player.provider === PROVIDER.VIMEO) vimeoPost(player, 'getCurrentTime');
  if (player.provider === PROVIDER.SOUNDCLOUD) scPost(player, 'getPosition');
}

// ---- time state store ----
const timeState = new Map(); // key -> seconds
const playState = new Map(); // key -> boolean
function setPlaying(p, v) { playState.set(playerKey(p), !!v); }
function isPlaying(p) { return !!playState.get(playerKey(p)); }

function playerKey(p) {
  return `${p.provider}|${p.src}`;
}

function setTime(p, seconds) {
  timeState.set(playerKey(p), seconds);
}

function getTime(p) {
  const t = timeState.get(playerKey(p));
  return typeof t === 'number' ? t : 0;
}

// ---- YouTube bridge communication (content script <-> page bridge) ----
function bridgeCmd(player, action, value) {
  window.postMessage(
    {
      __tag: BRIDGE_TAG,
      dir: 'EXT_TO_PAGE',
      provider: PROVIDER.YOUTUBE,
      src: player.src,
      action,
      value
    },
    '*'
  );
}

window.addEventListener('message', (e) => {
  const data = e.data;
  if (!data || data.__tag !== BRIDGE_TAG) return;

  // Only care about page->extension direction
  if (data.type === 'YT_TIME' && typeof data.time === 'number') {
    const p = cachedPlayers.find(x => x.provider === PROVIDER.YOUTUBE && x.src === data.src);
    if (p) setTime(p, data.time);
  }
});

// ---- Vimeo / SoundCloud responses ----
window.addEventListener('message', (e) => {
  // SoundCloud
  if (typeof e.data === 'string') {
    try {
      const data = JSON.parse(e.data);
      if (data && data.method === 'getPosition' && typeof data.value === 'number') {
        const p = cachedPlayers.find(x => x.el.contentWindow === e.source && x.provider === PROVIDER.SOUNDCLOUD);
        if (p) setTime(p, data.value / 1000);
      }
    } catch (_) {}
  }

  // Vimeo
  if (typeof e.data === 'object' && e.data) {
    const p = cachedPlayers.find(x => x.el.contentWindow === e.source && x.provider === PROVIDER.VIMEO);
    if (!p) return;

    if (e.data.event === 'timeupdate' && e.data.data && typeof e.data.data.seconds === 'number') {
      setTime(p, e.data.data.seconds);
    }
    if (e.data.method === 'getCurrentTime' && typeof e.data.value === 'number') {
      setTime(p, e.data.value);
    }
  }
});

setInterval(() => {
  for (const p of cachedPlayers) {
    if (p.provider === PROVIDER.VIMEO || p.provider === PROVIDER.SOUNDCLOUD) requestCurrentTime(p);
    if (p.provider === PROVIDER.YOUTUBE) requestCurrentTime(p);
  }
}, 1000);

function pickTargetPlayer(target) {
  if (target?.provider && target?.src) {
    const m = cachedPlayers.find(p => p.provider === target.provider && p.src === target.src);
    if (m) return m;
  }
  const visible = cachedPlayers
    .filter(p => p.el.getClientRects().length > 0)
    .map(p => ({ p, area: (p.el.clientWidth || 0) * (p.el.clientHeight || 0) }))
    .sort((a, b) => b.area - a.area);
  return visible[0]?.p || cachedPlayers[0] || null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
		if (msg?.type === 'GET_STATE') {
			const player = pickTargetPlayer(msg.target);
			if (!player) return sendResponse({ ok:false, error:'No target player' });

			return sendResponse({
				ok: true,
				state: {
					isPlaying: isPlaying(player),
					currentTime: getTime(player),
					provider: player.provider,
					src: player.src
				}
			});
		}

		if (msg?.type === 'CONTROL_TOGGLE_PLAY') {
			const player = pickTargetPlayer(msg.target);
			if (!player) return sendResponse({ ok:false, error:'No target player' });

			if (isPlaying(player)) providerPause(player);
			else providerPlay(player);

			requestCurrentTime(player);
			return sendResponse({ ok:true, nowPlaying: isPlaying(player) });
		}

		/* Get state for selected (or first) player
		if (msg?.type === 'GET_STATE') {
			const target = pickTarget(msg.target); // your existing selector helper
			if (!target) {
				sendResponse({ ok: false, error: 'No target player' });
				return true;
			}

			// Best-effort: currentTime is whatever you already track
			sendResponse({
				ok: true,
				state: {
					isPlaying: !!target.isPlaying,
					currentTime: typeof target.currentTime === 'number' ? target.currentTime : null,
					kind: target.kind || target.type || 'unknown'
				}
			});
			return true;
		}

		// Toggle play/pause
		if (msg?.type === 'CONTROL_TOGGLE_PLAY') {
			const target = pickTarget(msg.target);
			if (!target) {
				sendResponse({ ok: false, error: 'No target player' });
				return true;
			}

			// If we know state: toggle predictably
			const shouldPlay = !target.isPlaying;

			// Reuse your existing handlers for PLAY/PAUSE
			handleControl(target, shouldPlay ? 'PLAY' : 'PAUSE')
				.then(() => sendResponse({ ok: true, action: shouldPlay ? 'PLAY' : 'PAUSE' }))
				.catch((e) => sendResponse({ ok: false, error: String(e) }));

			return true; // async
		}
    */

    if (msg?.type === 'LIST_PLAYERS') {
      sendResponse({ ok: true, players: cachedPlayers.map(p => ({ provider: p.provider, src: p.src })) });
      return;
    }

		// Debug: confirm content script is alive
		if (msg?.type === 'PING') {
			console.log('[MNC content] PING received');
			sendResponse({ ok: true, pong: true });
			return true;
		}

    if (msg?.type === 'CONTROL') {
      const player = pickTargetPlayer(msg.target);
      if (!player) {
        sendResponse({ ok: false, error: 'No supported embedded player found on this page.' });
        return;
      }

      const delta = Number(msg.deltaSeconds ?? 10);
      const action = msg.action;

      if (action === 'PLAY') providerPlay(player);
      if (action === 'PAUSE') providerPause(player);
      if (action === 'REWIND') providerSeek(player, Math.max(0, getTime(player) - delta));
      if (action === 'FORWARD') providerSeek(player, getTime(player) + delta);

      requestCurrentTime(player);
      sendResponse({ ok: true, provider: player.provider, src: player.src, time: getTime(player) });
      return;
    }

    if (msg?.type === 'CONTROL_SEEK') {
      const player = pickTargetPlayer(msg.target);
      if (!player) {
        sendResponse({ ok: false, error: 'No supported embedded player found on this page.' });
        return;
      }
      providerSeek(player, Math.max(0, Number(msg.time) || 0));
      requestCurrentTime(player);
      sendResponse({ ok: true, provider: player.provider, src: player.src, time: getTime(player) });
      return;
    }

		if (msg?.type === 'CONTROL_SEEK_REL') {
			const player = pickTargetPlayer(msg.target);
			if (!player) return sendResponse({ ok:false, error:'No supported embedded player found.' });

			const delta = Number(msg.delta) || 0;
			providerSeek(player, Math.max(0, getTime(player) + delta));
			requestCurrentTime(player);
			return sendResponse({ ok:true, provider: player.provider, src: player.src, time: getTime(player) });
		}

    if (msg?.type === 'GET_TIME') {
      const player = pickTargetPlayer(msg.target);
      if (!player) {
        sendResponse({ ok: false, error: 'No supported embedded player found on this page.' });
        return;
      }
      requestCurrentTime(player);
      sendResponse({ ok: true, provider: player.provider, src: player.src, time: getTime(player) });
      return;
    }

    if (msg?.type === 'GET_TALK_METADATA') {
      const titleEl = document.querySelector('h1.entry-title');
      const subtitleEl = document.querySelector('h2.entry-subtitle');
      const dateEl = document.querySelector('time.entry-date.published');
      const taxonomyEl = document.querySelector('span.taxonomy-recorded-event-links');

      const title = titleEl?.textContent?.trim() || null;
      const place = subtitleEl?.querySelector('a')?.textContent?.trim()
        || subtitleEl?.textContent?.trim()
        || null;
      const date = dateEl?.getAttribute('datetime') || null;
      const taxonomy = taxonomyEl?.textContent?.trim() || null;

      sendResponse({
        ok: true,
        meta: { title, place, date, taxonomy }
      });
      return;
    }

    sendResponse({ ok: false, error: 'Unknown message type' });
  } catch (err) {
    sendResponse({ ok: false, error: String(err) });
  }
});


