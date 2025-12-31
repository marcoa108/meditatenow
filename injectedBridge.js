(() => {
  const ORIGIN_TAG = 'MEDIA_NOTES_BRIDGE';

  const PROVIDER = {
    YOUTUBE: 'youtube'
  };

  // --- YouTube Iframe API loader ---
  function loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(true);

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.documentElement.appendChild(tag);

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        try { if (typeof prev === 'function') prev(); } catch (_) {}
        resolve(true);
      };

      // Failsafe resolve after 10s (we can still attempt postMessage control)
      setTimeout(() => resolve(false), 10000);
    });
  }

  function isYouTubeIframe(iframe) {
    const src = iframe.src || '';
    return /youtube\.com\/embed\//i.test(src) || /youtube-nocookie\.com\/embed\//i.test(src);
  }

  function ensureEnableJsApi(iframe) {
    // YouTube Player API expects enablejsapi=1 and origin.
    // Setting iframe.src will reload the player (unavoidable if missing).
    try {
      const url = new URL(iframe.src, window.location.href);
      const has = url.searchParams.get('enablejsapi');
      if (has !== '1') {
        url.searchParams.set('enablejsapi', '1');
        url.searchParams.set('origin', window.location.origin);
        iframe.src = url.toString();
      }
    } catch (_) {}
  }

  const ytPlayersByIframe = new Map(); // iframeEl -> YT.Player
  const ytStateByKey = new Map(); // key -> { time, duration, ready }

  function keyForIframe(iframe) {
    const src = iframe.src || '';
    return `${PROVIDER.YOUTUBE}::${src}`;
  }

  function postToExtension(payload) {
    window.postMessage({ __tag: ORIGIN_TAG, ...payload }, '*');
  }

  function scanAndBindYouTubePlayers() {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const iframe of iframes) {
      if (!isYouTubeIframe(iframe)) continue;
      if (!iframe.id) iframe.id = `mnc_yt_${Math.random().toString(36).slice(2)}`;

      ensureEnableJsApi(iframe);

      if (ytPlayersByIframe.has(iframe)) continue;

      if (window.YT && window.YT.Player) {
        const player = new window.YT.Player(iframe.id, {
          events: {
            onReady: () => {
              ytStateByKey.set(keyForIframe(iframe), {
                time: 0,
                duration: safeCall(() => player.getDuration(), 0),
                ready: true
              });
              postToExtension({ type: 'YT_READY', src: iframe.src });
            },
            onStateChange: () => {
              // no-op; we poll time below
            }
          }
        });

        ytPlayersByIframe.set(iframe, player);
      }
    }
  }

  function safeCall(fn, fallback) {
    try { return fn(); } catch (_) { return fallback; }
  }

  // Poll time (lightweight)
  function pollTimes() {
    for (const [iframe, player] of ytPlayersByIframe.entries()) {
      const k = keyForIframe(iframe);
      const current = safeCall(() => player.getCurrentTime(), null);
      const dur = safeCall(() => player.getDuration(), null);
      if (typeof current === 'number') {
        const prev = ytStateByKey.get(k) || { time: 0, duration: 0, ready: true };
        ytStateByKey.set(k, {
          time: current,
          duration: typeof dur === 'number' ? dur : prev.duration,
          ready: true
        });
        postToExtension({ type: 'YT_TIME', src: iframe.src, time: current, duration: ytStateByKey.get(k).duration });
      }
    }
  }

  // Commands from extension -> bridge
  function handleCommand(msg) {
    if (!msg || msg.__tag !== ORIGIN_TAG || msg.dir !== 'EXT_TO_PAGE') return;
    if (msg.provider !== PROVIDER.YOUTUBE) return;

    const { src, action, value } = msg;

    // Find iframe by src (best-effort)
    const iframe = Array.from(document.querySelectorAll('iframe')).find(f => (f.src || '') === src);
    if (!iframe) return;

    const player = ytPlayersByIframe.get(iframe);
    if (!player) return;

    if (action === 'PLAY') safeCall(() => player.playVideo(), null);
    if (action === 'PAUSE') safeCall(() => player.pauseVideo(), null);
    if (action === 'SEEK') safeCall(() => player.seekTo(Math.max(0, Number(value) || 0), true), null);
    if (action === 'GET_TIME') {
      const t = safeCall(() => player.getCurrentTime(), 0);
      postToExtension({ type: 'YT_TIME', src: iframe.src, time: t, duration: safeCall(() => player.getDuration(), 0) });
    }
  }

  // Boot
  (async () => {
    await loadYouTubeAPI();
    scanAndBindYouTubePlayers();

    // rescan for SPA changes
    const mo = new MutationObserver(() => scanAndBindYouTubePlayers());
    mo.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('message', (e) => handleCommand(e.data));

    setInterval(pollTimes, 500);
  })();
})();