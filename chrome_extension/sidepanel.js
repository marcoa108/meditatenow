const statusEl = document.getElementById('status');
const timeReadoutEl = document.getElementById('timeReadout');
const playerSelect = document.getElementById('playerSelect');
const notesList = document.getElementById('notesList');
const noteText = document.getElementById('noteText');

// Audio recording UI
const recordBtn = document.getElementById('recordBtn');
//const stopBtn = document.getElementById('stopBtn');
const audioPreview = document.getElementById('audioPreview');
const recHint = document.getElementById('recHint');

// Tags + ticks UI
const tagInput = document.getElementById('tagInput');
const tagSelect = document.getElementById('tagSelect');
const useTagBtn = document.getElementById('useTagBtn');
const tagChips = document.getElementById('tagChips');

const langSelect = document.getElementById('langSelect');
const voiceSelect = document.getElementById('voiceSelect');
const enhanceAudioCb = document.getElementById('enhanceAudio');
const enhanceControls = document.getElementById('enhanceControls');
const trimSlider = document.getElementById('trimSlider');
const trimVal = document.getElementById('trimVal');

const tick1 = document.getElementById('tick1');
const tick2 = document.getElementById('tick2');
const tick3 = document.getElementById('tick3');
const tick4 = document.getElementById('tick4');
const tick5 = document.getElementById('tick5');
const tick6 = document.getElementById('tick6');
const tick7 = document.getElementById('tick7');
const tick8 = document.getElementById('tick8');
const tick9 = document.getElementById('tick9');
const tick10 = document.getElementById('tick10');
const tick11 = document.getElementById('tick11');
const tick12 = document.getElementById('tick12');
const tick13 = document.getElementById('tick13');

let selectedTags = []; // tags to apply to the next note
let exportDirectoryHandle = null; // Persistent export folder

// Chakra definitions with names and estimated positions (percentage-based)
// You can refine these coordinates using chakra-coordinate-detector.html
const CHAKRA_POINTS = [
  { id: 'chakras_above_sahasrara', name: 'Chakras above sahasrara', x: 49.87, y: 11.66 },
  { id: 'right_sahasrara', name: 'Right Sahasrara', x: 31.86, y: 16.98 },
  { id: 'center_sahasrara', name: 'Center Sahasrara', x: 49.60, y: 16.93 },
  { id: 'left_sahasrara', name: 'Left Sahasrara', x: 67.87, y: 16.96 },
  { id: 'ekadesha_rudra', name: 'Ekadesha Rudra', x: 49.87, y: 20.59 },
  { id: 'right_agnya', name: 'Right Agnya', x: 31.33, y: 23.82 },
  { id: 'center_agnya', name: 'Center Agnya', x: 49.33, y: 23.95 },
  { id: 'left_agnya', name: 'Left Agnya', x: 67.60, y: 24.03 },
  { id: 'hamsa', name: 'Hamsa', x: 49.60, y: 27.70 },
  { id: 'right_vishuddhi', name: 'Right Vishuddhi', x: 31.33, y: 41.17 },
  { id: 'center_vishuddhi', name: 'Center Vishuddhi', x: 50.40, y: 41.17 },
  { id: 'left_vishuddhi', name: 'Left Vishuddhi', x: 68.67, y: 41.23 },
  { id: 'shri', name: 'Shri', x: 12.79, y: 44.10 },
  { id: 'lalita', name: 'Lalita', x: 89.09, y: 44.04 },
  { id: 'right_anahat', name: 'Right Anahat', x: 31.86, y: 54.83 },
  { id: 'center_anahat', name: 'Center Anahat', x: 49.87, y: 54.70 },
  { id: 'left_anahat', name: 'Left Anahat', x: 67.60, y: 54.58 },
  { id: 'pingala', name: 'Pingala', x: 20.04, y: 62.99 },
  { id: 'sushumna', name: 'Sushumna', x: 50.13, y: 62.62 },
  { id: 'ida', name: 'Ida', x: 80.49, y: 62.74 },
  { id: 'right_nabhi', name: 'Right Nabhi', x: 31.60, y: 73.21 },
  { id: 'center_nabhi', name: 'Center Nabhi', x: 50.13, y: 73.28 },
  { id: 'left_nabhi', name: 'Left Nabhi', x: 67.87, y: 73.16 },
  { id: 'right_void', name: 'Right Void', x: 8.76, y: 77.68 },
  { id: 'center_void', name: 'Center Void', x: 49.87, y: 77.52 },
  { id: 'left_void', name: 'Left Void', x: 92.32, y: 77.58 },
  { id: 'right_swadisthan', name: 'Right Swadisthan', x: 32.13, y: 84.56 },
  { id: 'center_swadisthan', name: 'Center Swadisthan', x: 50.13, y: 84.49 },
  { id: 'left_swadisthan', name: 'Left Swadisthan', x: 68.14, y: 84.49 },
  { id: 'kundalini', name: 'Kundalini', x: 49.60, y: 89.48 },
  { id: 'right_mooladhara', name: 'Right Mooladhara', x: 31.33, y: 94.59 },
  { id: 'center_mooladhara', name: 'Center Mooladhara', x: 50.13, y: 94.34 },
  { id: 'left_mooladhara', name: 'Left Mooladhara', x: 67.60, y: 94.71 }
];

let selectedChakras = new Set(); // Track selected chakra IDs

// Initialize chakra chart with clickable overlays
function initChakraChart() {
  const overlay = document.querySelector('.chakraOverlay');
  if (!overlay) return;

  overlay.innerHTML = ''; // Clear any existing dots

  for (const point of CHAKRA_POINTS) {
    const dot = document.createElement('div');
    dot.className = 'chakraDot';

    // Make Pingala, Sushumna, and Ida larger
    if (point.id === 'pingala' || point.id === 'sushumna' || point.id === 'ida') {
      dot.classList.add('chakraDot-large');
    }

    dot.dataset.chakraId = point.id;
    dot.dataset.name = point.name;
    dot.style.left = `${point.x}%`;
    dot.style.top = `${point.y}%`;

    if (selectedChakras.has(point.id)) {
      dot.classList.add('selected');
    }

    dot.addEventListener('click', () => toggleChakra(point.id, dot));
    overlay.appendChild(dot);
  }
}

// Toggle chakra selection
function toggleChakra(chakraId, dotElement) {
  if (selectedChakras.has(chakraId)) {
    selectedChakras.delete(chakraId);
    dotElement.classList.remove('selected');
  } else {
    selectedChakras.add(chakraId);
    dotElement.classList.add('selected');
  }
}

// Draft audio linkage
let draftAudio = null; // { id, mime, createdAt }
let mediaRecorder = null;
let mediaStream = null;
let speechRec = null;
let speechTranscript = '';
let isRecording = false;

const btnTogglePlay = document.getElementById('btnTogglePlay');
const playPauseIcon = document.getElementById('playPauseIcon');
//const btnPlay = document.getElementById('btnPlay');
//const btnPause = document.getElementById('btnPause');
const btnRewind = document.getElementById('btnRew');
const btnForward = document.getElementById('btnFwd');
const btnRefreshTime = document.getElementById('refreshTime');
const btnAddNote = document.getElementById('addNote');
const btnExport = document.getElementById('exportNotes');
const btnClear = document.getElementById('clearNotes');
const btnSaveTop = document.getElementById('saveNoteTop');

let currentTabId;
let pageKey;
let players = [];
let currentTimeSeconds = 0;

bindContinuousSeek(btnRewind, -1);
bindContinuousSeek(btnForward, +1);

if (enhanceControls) enhanceControls.style.display = enhanceAudioCb?.checked ? 'block' : 'none';
if (trimVal) trimVal.textContent = getTrimThreshold().toFixed(3);

document.getElementById('clearDebug')?.addEventListener('click', () => {
  const el = document.getElementById('debugLog');
  if (el) el.value = '';
});

document.getElementById('setExportFolder')?.addEventListener('click', async () => {
  await setExportFolder();
});

function fmtTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// --- Debug logger (side panel UI + console) ---
const dbgEl = document.getElementById('debugLog');
function dbg(...args) {
  const line = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  console.log('[MNC]', ...args);
  if (dbgEl) {
    dbgEl.value += `[${new Date().toISOString()}] ${line}\n`;
    dbgEl.scrollTop = dbgEl.scrollHeight;
  }
}

async function ensureContentScript(tabId) {
  try {
    dbg('Injecting contentScript.js into tab', tabId);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['contentScript.js'],
    });
    return true;
  } catch (e) {
    dbg('Inject failed', String(e));
    return false;
  }
}

async function sendToTab(message) {
  if (!currentTabId) return { ok: false, error: 'No active tab selected' };

  dbg('sendToTab ->', message);

  // 1st try
  const first = await new Promise((resolve) => {
    chrome.tabs.sendMessage(currentTabId, message, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) resolve({ ok: false, error: err.message });
      else resolve(resp);
    });
  });

  if (first?.ok !== false) {
    dbg('sendToTab <-', first);
    return first;
  }

  // If no receiver, inject and retry once
  if ((first.error || '').includes('Receiving end does not exist')) {
    dbg('No receiver. Trying injection + retry…');
    const injected = await ensureContentScript(currentTabId);
    if (!injected) {
      return { ok: false, error: 'Cannot inject content script into this page/tab.' };
    }

    const second = await new Promise((resolve) => {
      chrome.tabs.sendMessage(currentTabId, message, (resp) => {
        const err = chrome.runtime.lastError;
        if (err) resolve({ ok: false, error: err.message });
        else resolve(resp);
      });
    });

    dbg('retry <-', second);
    return second;
  }

  dbg('sendToTab error:', first);
  return first;
}

function setPlayIcon(isPlaying) {
  if (!playPauseIcon) return;

  // pause icon if playing
  if (isPlaying) {
    playPauseIcon.innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>';
  } else {
    playPauseIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function renderPlayers() {
  playerSelect.innerHTML = '';

  const optAuto = document.createElement('option');
  optAuto.value = '__auto__';
  optAuto.textContent = 'Auto (largest visible)';
  playerSelect.appendChild(optAuto);

  for (const p of players) {
    const opt = document.createElement('option');
    opt.value = JSON.stringify(p);
    opt.textContent = `${p.provider.toUpperCase()} — ${truncate(p.src, 40)}`;
    playerSelect.appendChild(opt);
  }
}

function getTargetFromSelect() {
  const v = playerSelect.value;
  if (v === '__auto__') return null;
  try { return JSON.parse(v); } catch { return null; }
}

async function refreshPlayers() {
  const resp = await sendToTab({ type: 'LIST_PLAYERS' });
  if (!resp?.ok) {
    setStatus(resp?.error || 'Unable to reach page.');
    players = [];
    renderPlayers();
    return;
  }
  players = resp.players || [];
  renderPlayers();
  try {
		const st = await sendToTab({ type: 'GET_STATE', target: getTargetFromSelect() });
		if (st?.ok) setPlayIcon(!!st.state?.isPlaying);
	} catch (_) {}

  if (players.length === 0) setStatus('No supported embedded player found.');
  else setStatus(`Found ${players.length} player${players.length===1?'':'s'}.`);
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

async function seekRel(deltaSeconds) {
  const target = getTargetFromSelect();
  return await sendToTab({ type: 'CONTROL_SEEK_REL', delta: deltaSeconds, target });
}

// --- long-press continuous seek ---
function bindContinuousSeek(buttonEl, direction) {
  // direction: -1 (rew) or +1 (fwd)
  let timer = null;
  let fired = false;

  const step = 1.0;      // seconds per tick while holding
  const every = 150;     // ms between ticks while holding
  const initialDelay = 250; // ms before continuous begins (tap still does +/-10)

  function clear() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (holdInterval) clearInterval(holdInterval);
    holdInterval = null;
  }

  let holdInterval = null;

  async function startHold() {
    fired = false;
    clear();
    timer = setTimeout(async () => {
      fired = true;
      await seekRel(direction * step);
      holdInterval = setInterval(() => {
        seekRel(direction * step);
      }, every);
    }, initialDelay);
  }

  function endHold() {
    clear();
  }

  buttonEl.addEventListener('mousedown', startHold);
  buttonEl.addEventListener('mouseleave', endHold);
  window.addEventListener('mouseup', endHold);

  // touch
  buttonEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold();
  }, { passive: false });

  buttonEl.addEventListener('touchend', endHold);
  buttonEl.addEventListener('touchcancel', endHold);

  // On click, if we did NOT long-press, do the normal +/-10
  buttonEl.addEventListener('click', async () => {
    if (fired) return; // continuous already did work
    await seekRel(direction * 10);
    await refreshTime();
  });
}


async function refreshTime() {
  const target = getTargetFromSelect();
  const resp = await sendToTab({ type: 'GET_TIME', target });
  if (resp?.ok) {
    currentTimeSeconds = resp.time || 0;
    timeReadoutEl.textContent = fmtTime(currentTimeSeconds);
  } else {
    setStatus(resp?.error || 'Could not read time.');
  }
}

async function control(action) {
  const target = getTargetFromSelect();
  const resp = await sendToTab({ type: 'CONTROL', action, deltaSeconds: 10, target });
  if (resp?.ok) {
    currentTimeSeconds = resp.time ?? currentTimeSeconds;
    timeReadoutEl.textContent = fmtTime(currentTimeSeconds);
  } else {
    setStatus(resp?.error || 'Control failed.');
  }
}

function noteStorageKey() {
  return `notes::${pageKey}`;
}

async function loadNote() {
  const key = noteStorageKey();
  const data = await chrome.storage.local.get([key]);
  const raw = data[key];

  if (Array.isArray(raw)) {
    return raw[0] || null; // legacy array format
  }

  if (raw && typeof raw === 'object') return raw;
  return null;
}

async function saveNote(note) {
  const key = noteStorageKey();
  if (!note) {
    await chrome.storage.local.remove(key);
  } else {
    await chrome.storage.local.set({ [key]: note });
  }
}

// Build a unique tag list from existing notes to support "existing tag" selection
function extractExistingTags(notes) {
  const set = new Set();
  for (const n of notes) {
    for (const t of (n.tags || [])) set.add(String(t));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function renderTagSelect(options) {
  const current = tagSelect.value;
  tagSelect.innerHTML = '';
  const first = document.createElement('option');
  first.value = '';
  first.textContent = 'Choose existing tag…';
  tagSelect.appendChild(first);

  // Add stable tags that always appear
  const stableTags = ['Footsoak', 'Social', 'Collective', 'Relationships', 'Business', 'Deities'];

  // Combine stable tags with existing tags, remove duplicates, and sort
  const allTags = [...new Set([...stableTags, ...options])].sort((a, b) => a.localeCompare(b));

  for (const t of allTags) {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    tagSelect.appendChild(opt);
  }

  if (allTags.includes(current)) tagSelect.value = current;
}

function renderTagChips() {
  tagChips.innerHTML = '';
  for (const t of selectedTags) {
    const chip = document.createElement('div');
    chip.className = 'chip';

    const label = document.createElement('span');
    label.textContent = t;

    const x = document.createElement('button');
    x.className = 'ghost danger';
    x.textContent = '×';
    x.title = 'Remove tag';
    x.addEventListener('click', () => {
      selectedTags = selectedTags.filter(v => v !== t);
      renderTagChips();
    });

    chip.appendChild(label);
    chip.appendChild(x);
    tagChips.appendChild(chip);
  }
}

// Function #1: add a tag (new or existing) to the current note draft
function addTag(tagRaw) {
  const tag = String(tagRaw || '').trim();
  if (!tag) return;
  if (!selectedTags.includes(tag)) selectedTags.push(tag);
  renderTagChips();
}

// Function #2: read ticks state for the current note draft
function getTicks() {
  return {
    sampleTick1: !!tick1.checked,
    sampleTick2: !!tick2.checked,
    sampleTick3: !!tick3.checked
  };
}

// Function #2b: get type array based on ticks
function getType() {
  const types = [];
  if (tick1.checked) types.push('Prayer');
  if (tick2.checked) types.push('Blessing');
  if (tick3.checked) types.push('Affirmation');
  return types;
}

// Function #3: read chakra selections for the current note draft
function getChakras() {
  return Array.from(selectedChakras);
}

// Function #3b: get yantra array (chakra names)
function getYantra() {
  return Array.from(selectedChakras).map(id =>
    CHAKRA_POINTS.find(p => p.id === id)?.name || id
  );
}

// Function #4: get features array based on tick4, tick5, tick6
function getFeatures() {
  const features = [];
  if (tick4.checked) features.push('Gestures');
  if (tick5.checked) features.push('Elements');
  if (tick6.checked) features.push('Indian terms');
  return features;
}

// Function #5: get categories array based on tick7, tick8, tick9
function getCategories() {
  const categories = [];
  if (tick7.checked) categories.push('Workout');
  if (tick8.checked) categories.push('Growth');
  if (tick9.checked) categories.push('Introspection');
  return categories;
}

// Function #6: get level array based on tick10, tick11, tick12 (Literal is standalone)
function getLevel() {
  const level = [];
  if (tick10.checked) level.push('Basic');
  if (tick11.checked) level.push('Intermediate');
  if (tick12.checked) level.push('Advanced');
  return level;
}

// Function #6b: standalone Literal flag (not a level)
function getLiteralFlag() {
  return !!tick13?.checked;
}

// --- IndexedDB for audio blobs (audio is saved separately from notes, but linked) ---
const AUDIO_DB = 'mnc_audio_db';
const AUDIO_STORE = 'clips';

function openAudioDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AUDIO_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveAudioBlob(blob) {
  const db = await openAudioDB();
  const id = crypto.randomUUID();
  const record = {
    id,
    mime: blob.type || 'audio/webm',
    createdAt: Date.now(),
    blob
  };

  await new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });

  return { id, mime: record.mime, createdAt: record.createdAt };
}

async function loadAudioBlob(id) {
  const db = await openAudioDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const req = tx.objectStore(AUDIO_STORE).get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteAudioBlob(id) {
  const db = await openAudioDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// --- Speech-to-text (best effort) ---
function canTranscribe() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startSpeechRecognition() {
  speechTranscript = '';
  if (!canTranscribe()) return null;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = (langSelect?.value === 'it') ? 'it-IT' : 'en-US';

  rec.onresult = (event) => {
    let finalText = '';
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const txt = res[0]?.transcript || '';
      if (res.isFinal) finalText += txt + ' ';
      else interim += txt;
    }
    if (finalText) speechTranscript += finalText;

    const combined = (speechTranscript + (interim ? ' ' + interim : '')).trim();
    if (combined) noteText.value = combined;
  };

  rec.onerror = () => {
    // If speech fails, we still keep the audio.
  };

  try { rec.start(); } catch (_) {}
  return rec;
}

function stopSpeechRecognition() {
  try { speechRec?.stop(); } catch (_) {}
  speechRec = null;
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;

  // interleave
  let interleaved;
  if (numChannels === 1) {
    interleaved = audioBuffer.getChannelData(0);
  } else {
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.getChannelData(1);
    interleaved = new Float32Array(numFrames * 2);
    let idx = 0;
    for (let i = 0; i < numFrames; i++) {
      interleaved[idx++] = ch0[i];
      interleaved[idx++] = ch1[i];
    }
  }

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  floatTo16BitPCM(view, 44, interleaved);
  return new Blob([view], { type: 'audio/wav' });
}

function findTrimBounds(buffer, thresholdRms = 0.004, winMs = 25, hopMs = 10, minHoldMs = 120) {
  const sr = buffer.sampleRate;
  const win = Math.max(16, Math.floor((winMs / 1000) * sr));
  const hop = Math.max(8, Math.floor((hopMs / 1000) * sr));
  const minHold = Math.max(1, Math.floor(minHoldMs / hopMs));

  // Mixdown to mono (on the fly)
  const chans = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) chans.push(buffer.getChannelData(c));

  function rmsAt(start) {
    const end = Math.min(buffer.length, start + win);
    let sum = 0;
    let count = 0;
    for (let i = start; i < end; i++) {
      let s = 0;
      for (let c = 0; c < chans.length; c++) s += chans[c][i];
      s /= chans.length;
      sum += s * s;
      count++;
    }
    return Math.sqrt(sum / Math.max(1, count));
  }

  // Build RMS frames
  const frames = [];
  for (let p = 0; p < buffer.length; p += hop) frames.push(rmsAt(p));

  // Find first region above threshold for minHold frames
  let startFrame = 0;
  for (; startFrame < frames.length; startFrame++) {
    if (frames[startFrame] >= thresholdRms) {
      let ok = true;
      for (let k = 0; k < minHold && startFrame + k < frames.length; k++) {
        if (frames[startFrame + k] < thresholdRms) { ok = false; break; }
      }
      if (ok) break;
    }
  }

  // Find last region above threshold for minHold frames
  let endFrame = frames.length - 1;
  for (; endFrame > startFrame; endFrame--) {
    if (frames[endFrame] >= thresholdRms) {
      let ok = true;
      for (let k = 0; k < minHold && endFrame - k > startFrame; k++) {
        if (frames[endFrame - k] < thresholdRms) { ok = false; break; }
      }
      if (ok) break;
    }
  }

  // Convert to sample bounds
  let start = Math.max(0, startFrame * hop);
  let end = Math.min(buffer.length - 1, endFrame * hop + win);

  // Safety: if it trims to < 0.3s, treat as failure and keep all
  const dur = (end - start + 1) / sr;
  if (!isFinite(dur) || dur < 0.3) {
    return { start: 0, end: buffer.length - 1, failed: true };
  }

  // Pad 50ms
  const pad = Math.floor(0.05 * sr);
  start = Math.max(0, start - pad);
  end = Math.min(buffer.length - 1, end + pad);

  return { start, end, failed: false };
}


function trimBuffer(buffer, start, end) {
  const length = Math.max(1, end - start + 1);
  const out = new AudioBuffer({
    length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate
  });

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    out.getChannelData(c).set(buffer.getChannelData(c).subarray(start, end + 1));
  }
  return out;
}

function noiseGateInPlace(buffer, gate = 0.01, atten = 0.15) {
  // very lightweight "clean noise": attenuate near-silence
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) < gate) data[i] *= atten;
    }
  }
}

function normalizeInPlace(buffer, targetPeak = 0.89) {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak < 1e-6) return 1;
  const gain = targetPeak / peak;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) data[i] *= gain;
  }
  return gain;
}


function analyzeBuffer(buffer) {
	const sr = buffer.sampleRate;
	const n = buffer.length;
	let peak = 0;
	let sumSq = 0;

	// mixdown abs + rms across channels
	const chans = [];
	for (let c = 0; c < buffer.numberOfChannels; c++) chans.push(buffer.getChannelData(c));

	for (let i = 0; i < n; i++) {
		let s = 0;
		for (let c = 0; c < chans.length; c++) s += chans[c][i];
		s = s / chans.length;
		peak = Math.max(peak, Math.abs(s));
		sumSq += s * s;
	}

	const rms = Math.sqrt(sumSq / Math.max(1, n));
	return { duration: n / sr, sr, peak, rms };
}

function msToSamples(ms, sr) {
	return Math.max(0, Math.floor((ms / 1000) * sr));
}

async function enhanceAudioBlob(blob, dbgFn = console.log) {
  const ab = await blob.arrayBuffer();
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  let decoded;
  try {
    decoded = await ac.decodeAudioData(ab.slice(0));
  } finally {
    try { await ac.close(); } catch (_) {}
  }

  const before = analyzeBuffer(decoded);
  dbgFn('Enhance: BEFORE peak=', before.peak.toFixed(5),
        'rms=', before.rms.toFixed(5),
        'dur=', before.duration.toFixed(3),
        'sr=', before.sr);

  // Windowed RMS trim (robust for voice)
  //const bounds = findTrimBounds(decoded, 0.004, 25, 10, 120);
  const thr = getTrimThreshold();
	const bounds = findTrimBounds(decoded, thr, 25, 10, 120);
	dbgFn('Enhance: threshold=', thr.toFixed(3));
	dbgFn('Enhance: bounds', bounds);

  const trimmed = trimBuffer(decoded, bounds.start, bounds.end);
  const mid = analyzeBuffer(trimmed);
  dbgFn('Enhance: AFTER TRIM peak=', mid.peak.toFixed(5),
        'rms=', mid.rms.toFixed(5),
        'dur=', mid.duration.toFixed(3));

  // Gentle noise cleanup + normalize
  noiseGateInPlace(trimmed, 0.003, 0.35);
  const gain = normalizeInPlace(trimmed, 0.89);

  const after = analyzeBuffer(trimmed);
  dbgFn('Enhance: AFTER GATE+NORM peak=', after.peak.toFixed(5),
        'rms=', after.rms.toFixed(5),
        'gain=', gain.toFixed(3),
        'dur=', after.duration.toFixed(3));

  // Export WAV
  const wav = encodeWAV(trimmed);
  return { blob: wav, duration: trimmed.duration };
}


async function startRecording() {
  dbg('startRecording() clicked');
  if (isRecording) return;
	isRecording = true;
	recordBtn.classList.add('recording');
	recordBtn.title = 'Stop recording (R)';
  draftAudio = null;
  audioPreview.style.display = 'none';
  audioPreview.src = '';
  noteText.value = '';
  speechTranscript = '';

  // Check availability
  dbg('navigator.mediaDevices:', !!navigator.mediaDevices);
  dbg('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
  dbg('MediaRecorder:', typeof MediaRecorder !== 'undefined');

  // Try permission introspection (best-effort; may throw)
  try {
    const p = await navigator.permissions.query({ name: 'microphone' });
    dbg('mic permission state:', p.state);
  } catch (e) {
    dbg('permissions.query(microphone) not available:', String(e));
  }

  // Request mic stream
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    dbg('getUserMedia OK. tracks=', mediaStream.getTracks().map(t => `${t.kind}:${t.readyState}`));
  } catch (e) {
    dbg('getUserMedia FAILED:', e?.name, e?.message || String(e));
    setStatus(`Microphone error: ${e?.name || 'unknown'} (${e?.message || e})`);
		isRecording = false;
		recordBtn.classList.remove('recording');
		recordBtn.title = 'Record (R)';
    return;
  }

  // Choose best mime
  const preferred = 'audio/webm;codecs=opus';
  const usePreferred = MediaRecorder.isTypeSupported?.(preferred);
  const options = usePreferred ? { mimeType: preferred } : undefined;
  dbg('MediaRecorder mime preferred supported?', !!usePreferred, 'options=', options || '(default)');

  const chunks = [];
  try {
    mediaRecorder = new MediaRecorder(mediaStream, options);
  } catch (e) {
    dbg('MediaRecorder ctor FAILED:', e?.name, e?.message || String(e));
    setStatus('MediaRecorder failed to start in this browser.');
    try { mediaStream.getTracks().forEach(t => t.stop()); } catch (_) {}
    return;
  }

  mediaRecorder.onstart = () => dbg('MediaRecorder onstart');
  mediaRecorder.onerror = (ev) => dbg('MediaRecorder onerror', ev?.error?.name, ev?.error?.message);
  mediaRecorder.ondataavailable = (ev) => {
    dbg('ondataavailable size=', ev.data?.size, 'type=', ev.data?.type);
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  mediaRecorder.onstop = async () => {
    dbg('MediaRecorder onstop. chunks=', chunks.length);
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordBtn.title = 'Record (R)';
    const mime = mediaRecorder.mimeType || 'audio/webm';
    let blob = new Blob(chunks, { type: mime });
		let clipDuration = null;
		dbg('Recorded blob size=', blob.size, 'type=', blob.type);

		// TEMP: preview raw first (so you can hear if recording is OK)
		const rawUrl = URL.createObjectURL(blob);
		audioPreview.src = rawUrl;
		audioPreview.style.display = 'block';
		dbg('RAW preview URL set');

		if (enhanceAudioCb?.checked) {
			try {
				dbg('Enhance: enabled, processing…');
				const enhanced = await enhanceAudioBlob(blob, dbg);
				blob = enhanced.blob;
				clipDuration = enhanced.duration;
				dbg('Enhance: done. new size=', blob.size, 'type=', blob.type, 'dur=', clipDuration);
			} catch (e) {
				dbg('Enhance FAILED, using raw audio:', String(e));
			}
		} else {
			// best-effort duration (raw) using audio element
			try {
				const tmpUrl = URL.createObjectURL(blob);
				clipDuration = await new Promise((resolve) => {
					const a = new Audio();
					a.preload = 'metadata';
					a.src = tmpUrl;
					a.onloadedmetadata = () => { resolve(a.duration || null); URL.revokeObjectURL(tmpUrl); };
					a.onerror = () => { resolve(null); URL.revokeObjectURL(tmpUrl); };
				});
			} catch (_) {}
		}

		draftAudio = await saveAudioBlob(blob);
		draftAudio.duration = clipDuration; // attach for note saving

    audioPreview.src = URL.createObjectURL(blob);
    audioPreview.style.display = 'block';

    try { mediaStream.getTracks().forEach(t => t.stop()); } catch (_) {}
    mediaStream = null;

    stopSpeechRecognition();
    recHint.textContent = canTranscribe()
      ? 'Audio saved and transcribed (editable).'
      : 'Audio saved. Transcription not supported here; type/edit transcript manually.';

    recordBtn.disabled = false;
    //stopBtn.disabled = true;
  };

  // Start speech recognition in parallel (best-effort)
  dbg('SpeechRecognition supported?', canTranscribe());
  speechRec = startSpeechRecognition();

  try {
    mediaRecorder.start();
    dbg('mediaRecorder.start() called');
  } catch (e) {
    dbg('mediaRecorder.start FAILED:', String(e));
    setStatus('MediaRecorder.start() failed.');
    return;
  }

  //recordBtn.disabled = true;
  //stopBtn.disabled = false;
  recHint.textContent = 'Recording… speak your note.';
}

function stopRecording() {
  dbg('stopRecording() clicked');
  try { mediaRecorder?.stop(); } catch (e) { dbg('mediaRecorder.stop FAILED:', String(e)); }
}

function renderNotes(note) {
  notesList.innerHTML = '';
  if (!note) {
    const empty = document.createElement('div');
    empty.className = 'tiny';
    empty.textContent = 'No notes yet.';
    notesList.appendChild(empty);
    return;
  }

  const item = document.createElement('div');
  item.className = 'noteItem';

  const top = document.createElement('div');
  top.className = 'noteTop';

  const time = document.createElement('div');
  time.className = 'noteTime';
  time.textContent = fmtTime(note.time);

  const actions = document.createElement('div');

  const btnGo = document.createElement('button');
  btnGo.className = 'ghost';
  btnGo.textContent = 'Go';
  btnGo.title = 'Seek to time';
  btnGo.addEventListener('click', async () => {
    const target = getTargetFromSelect();
    await sendToTab({ type: 'CONTROL_SEEK', time: note.time, target });
    await refreshTime();
  });

  const btnDel = document.createElement('button');
  btnDel.className = 'ghost danger';
  btnDel.textContent = 'Del';
  btnDel.title = 'Delete note';
  btnDel.addEventListener('click', async () => {
    const deleting = await loadNote();

    // delete linked audio blob
    if (deleting?.clip?.id) {
      try { await deleteAudioBlob(deleting.clip.id); } catch (_) {}
    }

    await saveNote(null);
    renderNotes(null);
    renderTagSelect([]);
  });

  actions.appendChild(btnGo);
  actions.appendChild(btnDel);

  top.appendChild(time);
  top.appendChild(actions);

  const text = document.createElement('div');
  text.className = 'noteText';
  text.textContent = note.clip?.transcript || '';

  const meta = document.createElement('div');
  meta.className = 'tiny';

  const tags = (note.tags || []).map(t => `#${t}`).join(' ');
  const ticks = note.ticks || {};
  const tickMarks = [
    ticks.sampleTick1 ? '☑︎1' : '☐1',
    ticks.sampleTick2 ? '☑︎2' : '☐2',
    ticks.sampleTick3 ? '☑︎3' : '☐3'
  ].join('  ');

  // Type display
  const typeStr = (note.type && note.type.length > 0) ? ` · Type: ${note.type.join(', ')}` : '';

  // Features display
  const featuresStr = (note.features && note.features.length > 0) ? ` · Features: ${note.features.join(', ')}` : '';

  // Categories display
  const categoriesStr = (note.categories && note.categories.length > 0) ? ` · Categories: ${note.categories.join(', ')}` : '';

  // Level + Literal display (Literal is a separate flag)
  const levelNames = Array.isArray(note.level) ? note.level.filter(l => l !== 'Literal') : [];
  const literalFlag = note.literal === true || (Array.isArray(note.level) && note.level.includes('Literal'));
  const levelStr = levelNames.length > 0 ? ` · Level: ${levelNames.join(', ')}` : '';
  const literalStr = literalFlag ? ' · Literal' : '';

  // Yantra display (use yantra field if available, otherwise fall back to chakras)
  const yantraNames = note.yantra && note.yantra.length > 0
    ? note.yantra.join(', ')
    : (note.chakras || []).map(id => CHAKRA_POINTS.find(p => p.id === id)?.name || id).join(', ');
  const yantraInfo = yantraNames ? ` · Yantra: ${yantraNames}` : '';

  const hasAudio = !!note.clip?.id;
  const lang = note.language ? ` · ${note.language.toUpperCase()}` : '';
  const dur = (typeof note.clip?.duration === 'number' && isFinite(note.clip.duration))
    ? ` · ⏱ ${note.clip.duration.toFixed(1)}s`
    : '';

  meta.textContent = `${tags}${tags ? '  ·  ' : ''}${tickMarks}${typeStr}${featuresStr}${categoriesStr}${levelStr}${literalStr}${yantraInfo}${hasAudio ? '  ·  🎙️' : ''}${lang}${dur}`;

  item.appendChild(top);
  item.appendChild(text);
  // audio playback
  if (note.clip?.id) {
    const audioWrap = document.createElement('div');
    audioWrap.className = 'tiny';
    audioWrap.style.marginTop = '6px';

    const playBtn = document.createElement('button');
    playBtn.className = 'ghost';
    playBtn.textContent = 'Play audio';

    let audioEl = null;
    let objectUrl = null;

    playBtn.addEventListener('click', async () => {
      if (!audioEl) {
        const blob = await loadAudioBlob(note.clip.id);
        if (!blob) {
          setStatus('Audio not found (it may have been cleared).');
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = objectUrl;
        audioEl.style.width = '100%';
        audioEl.addEventListener('ended', () => {
          // keep controls visible
        });
        audioWrap.appendChild(audioEl);
        playBtn.textContent = 'Hide audio';
      } else {
        // toggle
        if (audioEl.style.display === 'none') {
          audioEl.style.display = 'block';
          playBtn.textContent = 'Hide audio';
        } else {
          audioEl.pause();
          audioEl.style.display = 'none';
          playBtn.textContent = 'Show audio';
        }
      }
    });

    audioWrap.appendChild(playBtn);
    item.appendChild(audioWrap);
  }

  item.appendChild(meta);

  notesList.appendChild(item);
}

async function fetchTalkMetadata() {
  const resp = await sendToTab({ type: 'GET_TALK_METADATA' });
  if (resp?.ok) return resp.meta || {};
  return {};
}

async function addNote() {
  // In the new flow, a note is anchored to an audio recording.
  if (!draftAudio?.id) {
    setStatus('Record an audio note first (then save).');
    return;
  }

  const text = (noteText.value || '').trim();
  if (!text) {
    setStatus('Transcript is empty. Add/edit transcript before saving.');
    return;
  }

  await refreshTime();

  const previousNote = await loadNote();
  const language = langSelect?.value || 'en';
  const voice = voiceSelect?.value || 'Marco';
  const mediaUrls = (players || []).map(p => p.src); // from LIST_PLAYERS
  const clipDuration = draftAudio?.duration ?? null;
  const talkMeta = await fetchTalkMetadata();

  // Generate audio filename if there's audio
  let audioFilename = null;
  if (draftAudio) {
    const timeStr = fmtTime(currentTimeSeconds).replace(':', '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const extension = draftAudio.mime?.includes('webm') ? 'webm' :
                     draftAudio.mime?.includes('wav') ? 'wav' :
                     draftAudio.mime?.includes('mp4') ? 'mp4' : 'webm';
    audioFilename = `audio-${timeStr}-${timestamp}.${extension}`;
  }

  const note = {
    id: crypto.randomUUID(),
    time: currentTimeSeconds,
    talk: {
      page: pageKey,
      mediaUrls,
      title: talkMeta.title || null,
      place: talkMeta.place || null,
      date: talkMeta.date || null,
      taxonomy: talkMeta.taxonomy || null
    },
    clip: draftAudio ? {
      filename: audioFilename,
      duration: clipDuration,
      voice,
      id: draftAudio.id,
      transcript: text,
      mime: draftAudio.mime
    } : null,
    language,
    tags: selectedTags.slice(),
    type: getType(),
    yantra: getYantra(),
    features: getFeatures(),
    categories: getCategories(),
    level: getLevel(),
    literal: getLiteralFlag(),
    createdAt: Date.now()
  };

  await saveNote(note);

  // Clean up previous audio blob if we replaced the note with a new clip
  if (previousNote?.clip?.id && previousNote.clip.id !== note.clip?.id) {
    try { await deleteAudioBlob(previousNote.clip.id); } catch (_) {}
  }

  // reset draft UI - keep tags, ticks, and chakras for next note
  noteText.value = '';
  // selectedTags, tick boxes, and chakras remain as is for the next note

  draftAudio = null;
  audioPreview.pause();
  audioPreview.src = '';
  audioPreview.style.display = 'none';
  recHint.textContent = 'Record an audio note; we\'ll transcribe it automatically.';

  renderNotes(note);
  renderTagSelect(extractExistingTags(note ? [note] : []));

  return note; // Return the created note
}
// Export folder management using File System Access API
async function setExportFolder() {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });
    exportDirectoryHandle = handle;

    // Store handle in IndexedDB for persistence
    await storeDirectoryHandle(handle);
    setStatus('Export folder set successfully!');
    return true;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Failed to set export folder:', err);
      setStatus('Failed to set export folder');
    }
    return false;
  }
}

async function storeDirectoryHandle(handle) {
  const db = await openAudioDB(); // Reuse existing DB
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clips', 'readwrite');
    // Store handle with a special key
    const store = tx.objectStore('clips');
    store.put({ id: '__export_dir_handle__', handle: handle });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadDirectoryHandle() {
  try {
    const db = await openAudioDB();
    const handle = await new Promise((resolve, reject) => {
      const tx = db.transaction('clips', 'readonly');
      const req = tx.objectStore('clips').get('__export_dir_handle__');
      req.onsuccess = () => resolve(req.result?.handle);
      req.onerror = () => reject(req.error);
    });

    if (handle) {
      // Request permission to use the stored handle
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        exportDirectoryHandle = handle;
        return handle;
      } else if (permission === 'prompt') {
        const newPermission = await handle.requestPermission({ mode: 'readwrite' });
        if (newPermission === 'granted') {
          exportDirectoryHandle = handle;
          return handle;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load directory handle:', err);
  }
  return null;
}

async function writeFileToDirectory(directoryHandle, filename, blob) {
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function exportNotes() {
  const note = await loadNote();
  if (!note) {
    setStatus('No note to export.');
    return;
  }

  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `media-notes-${timestamp}.json`;

  const payload = {
    page: pageKey,
    exportedAt: new Date().toISOString(),
    note
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

  // Try to use stored directory handle first
  let dirHandle = exportDirectoryHandle || await loadDirectoryHandle();

  if (dirHandle) {
    try {
      await writeFileToDirectory(dirHandle, filename, blob);
      setStatus('Notes exported successfully!');
      return;
    } catch (err) {
      console.error('Failed to write to directory:', err);
      setStatus('Export failed, trying alternate method...');
      // Fall through to alternate method
    }
  }

  // Fallback: prompt user to set folder or use downloads
  if (!dirHandle) {
    const userWantsToSetFolder = confirm('Export folder not set. Would you like to choose a folder now?');
    if (userWantsToSetFolder) {
      const success = await setExportFolder();
      if (success) {
        // Try again with new folder
        await writeFileToDirectory(exportDirectoryHandle, filename, blob);
        setStatus('Notes exported successfully!');
        return;
      }
    }
  }

  // Last resort: use downloads API
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    setStatus('Notes exported to Downloads folder');
  } catch (err) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setStatus('Notes exported');
  }
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportSingleNote(note) {
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const timeStr = fmtTime(note.time).replace(':', '-');
  const filename = `note-${timeStr}-${timestamp}.json`;

  const payload = {
    page: pageKey,
    exportedAt: new Date().toISOString(),
    note
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

  // Try to use stored directory handle first
  let dirHandle = exportDirectoryHandle || await loadDirectoryHandle();

  if (dirHandle) {
    try {
      await writeFileToDirectory(dirHandle, filename, blob);
      setStatus('Note saved successfully!');
      return;
    } catch (err) {
      console.error('Failed to write to directory:', err);
      setStatus('Save failed, trying alternate method...');
      // Fall through to alternate method
    }
  }

  // Fallback: prompt user to set folder or use downloads
  if (!dirHandle) {
    const userWantsToSetFolder = confirm('Export folder not set. Would you like to choose a folder now?');
    if (userWantsToSetFolder) {
      const success = await setExportFolder();
      if (success) {
        // Try again with new folder
        await writeFileToDirectory(exportDirectoryHandle, filename, blob);
        setStatus('Note saved successfully!');
        return;
      }
    }
  }

  // Last resort: use downloads API
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    setStatus('Note saved to Downloads folder');
  } catch (err) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setStatus('Note saved');
  }
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportSingleAudioFile(note) {
  if (!note.clip || !note.clip.id) return;

  try {
    const blob = await loadAudioBlob(note.clip.id);
    if (!blob) {
      setStatus('Audio not found');
      return;
    }

    // Use stored filename
    const filename = note.clip.filename;

    let dirHandle = exportDirectoryHandle || await loadDirectoryHandle();

    // Try to use directory handle first
    if (dirHandle) {
      try {
        await writeFileToDirectory(dirHandle, filename, blob);
        setStatus('Audio saved successfully!');
        return;
      } catch (err) {
        console.error('Failed to write audio to directory:', err);
        // Fall through to downloads API
      }
    }

    // Fallback to downloads API
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    setStatus('Audio saved to Downloads folder');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Failed to export audio:', err);
    setStatus('Failed to save audio');
  }
}

async function exportAudioFiles() {
  const note = await loadNote();
  if (!note?.clip?.id) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  let dirHandle = exportDirectoryHandle || await loadDirectoryHandle();

  try {
    const blob = await loadAudioBlob(note.clip.id);
    if (!blob) return;

    // Use stored filename if available, otherwise generate one
    let filename = note.clip.filename;
    if (!filename) {
      const timeStr = fmtTime(note.time).replace(':', '-');
      const extension = note.clip.mime?.includes('webm') ? 'webm' :
                       note.clip.mime?.includes('wav') ? 'wav' :
                       note.clip.mime?.includes('mp4') ? 'mp4' : 'webm';
      filename = `audio-${timeStr}-${timestamp}.${extension}`;
    }

    // Try to use directory handle first
    if (dirHandle) {
      try {
        await writeFileToDirectory(dirHandle, filename, blob);
        setStatus('Exported 1 audio file');
        return;
      } catch (err) {
        console.error('Failed to write audio to directory:', err);
        // Fall through to downloads API
      }
    }

    // Fallback to downloads API
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Exported 1 audio file');
  } catch (err) {
    console.error('Failed to export audio:', err);
  }
}

async function clearNotes() {
  const existing = await loadNote();
  if (existing?.clip?.id) {
    try { await deleteAudioBlob(existing.clip.id); } catch (_) {}
  }
  await saveNote(null);
  renderNotes(null);
  renderTagSelect([]);
}

async function init() {
  const tab = await getActiveTab();
  currentTabId = tab.id;
  pageKey = tab.url || 'unknown';

  // Load export directory handle
  await loadDirectoryHandle();

  // ✅ Debug ping after tab is known
  const ping = await sendToTab({ type: 'PING' });
  dbg('PING result:', ping);
  await refreshPlayers();
  await refreshTime();

  const note = await loadNote();
  renderNotes(note);
  renderTagSelect(extractExistingTags(note ? [note] : []));
  renderTagChips();
  initChakraChart();
}

function getTrimThreshold() {
  const v = Number(trimSlider?.value);
  return isFinite(v) && v > 0 ? v : 0.004;
}

enhanceAudioCb?.addEventListener('change', () => {
  if (enhanceControls) enhanceControls.style.display = enhanceAudioCb.checked ? 'block' : 'none';
});

trimSlider?.addEventListener('input', () => {
  if (trimVal) trimVal.textContent = getTrimThreshold().toFixed(3);
});

//btnPlay.addEventListener('click', () => control('PLAY'));
//btnPause.addEventListener('click', () => control('PAUSE'));
btnTogglePlay?.addEventListener('click', async () => {
  const resp = await sendToTab({ type: 'CONTROL_TOGGLE_PLAY', target: getTargetFromSelect() });
  dbg('TOGGLE_PLAY resp', resp);

  // Best-effort: if response returns nowPlaying, use it; otherwise ask state.
  if (resp?.ok && typeof resp.nowPlaying === 'boolean') {
    setPlayIcon(resp.nowPlaying);
  } else {
    const st = await sendToTab({ type: 'GET_STATE', target: getTargetFromSelect() });
    if (st?.ok?.toString?.() === 'true' || st?.ok === true) setPlayIcon(!!st.state?.isPlaying);
  }
	// ✅ always refresh current time after a toggle (especially on pause)
  await refreshTime();
});
//btnRewind.addEventListener('click', () => control('REWIND'));
//btnForward.addEventListener('click', () => control('FORWARD'));
//btnRefreshTime.addEventListener('click', refreshTime);

// Recording controls
//recordBtn.addEventListener('click', startRecording);
//stopBtn.addEventListener('click', stopRecording);
recordBtn.addEventListener('click', async () => {
  if (!isRecording) await startRecording();
  else stopRecording();
});
btnClear.addEventListener('click', clearNotes);
btnSaveTop.addEventListener('click', async () => {
  // Add the current note and get it back
  const note = await addNote();

  // Only export if note was successfully created
  if (note) {
    // Export just this single note
    await exportSingleNote(note);

    // Export audio file if it exists
    if (note.clip && note.clip.id) {
      await exportSingleAudioFile(note);
    }
  }
});

window.addEventListener('keydown', async (e) => {
  if (isTypingTarget(e.target)) return;

  // Space: toggle play/pause
  if (e.code === 'Space') {
    e.preventDefault();
    // try pause first? better: ask current state — we don’t track reliably across all players,
    // so we implement a simple heuristic: if time is advancing? (skip for now)
    //await sendToTab({ type: 'CONTROL_TOGGLE_PLAY', target: getTargetFromSelect() });
    btnTogglePlay?.click();
		return;
  }

  // Left/Right arrows: seek -10/+10
  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    await seekRel(-10);
    await refreshTime();
    return;
  }

  if (e.code === 'ArrowRight') {
    e.preventDefault();
    await seekRel(+10);
    await refreshTime();
    return;
  }

  // R: record/stop
  if (e.key.toLowerCase() === 'r') {
    e.preventDefault();
    if (!isRecording) await startRecording();
    else stopRecording();
  }
});

// Tag controls
useTagBtn.addEventListener('click', () => {
  if (tagSelect.value) addTag(tagSelect.value);
});

tagInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTag(tagInput.value);
    tagInput.value = '';
  }
});
playerSelect.addEventListener('change', refreshTime);

// Refresh when the active tab changes (common when side panel stays open)
chrome.tabs.onActivated.addListener(async () => {
  await init();
});
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (tabId === currentTabId && info.status === 'complete') {
    await init();
  }
});

init();
