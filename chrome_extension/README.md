# Media Notes Recorder Chrome Extension

This extension adds a side panel that lets you control embedded media players (YouTube, Vimeo, and SoundCloud) and capture timestamped notes as you watch or listen.

## Core behavior
- **Side panel launcher:** The extension opens in Chrome's side panel when the toolbar icon is clicked, thanks to the background service worker configuring `openPanelOnActionClick`.
- **Player detection:** A content script scans each page for supported iframes and keeps an up-to-date list of available players, preferring the largest visible player when multiple are present.
- **Playback control:** The side panel can play/pause, seek forward/backward (with long-press scrubbing), and fetch the current timestamp for the selected player. YouTube control is mediated by an injected bridge that uses the Iframe API; Vimeo and SoundCloud are driven via `postMessage` commands.
- **Time syncing:** The content script polls players for their current position so the side panel can show live timestamps and attach them to notes.

## Note taking and tagging
- **Timestamped notes:** Notes are saved per page URL via `chrome.storage.local`, pairing the captured text with the current playback time.
- **Chakra map:** The side panel overlays clickable chakra points on the provided chart image so users can record which areas apply to a note.
- **Tags and categories:** Users can type new tags, pick from existing/stable tags, and mark checkboxes for features (e.g., Gestures, Elements), categories (Workout, Growth, Introspection), and levels (Basic/Intermediate/Advanced). Selected tags render as removable chips.
- **Tick presets:** Quick checkboxes (Please, By Your Grace, I Affirm) populate note metadata to describe the note’s tone or intent.

## Audio capture and transcription helpers
- **In-panel recorder:** A record toggle starts/stops capturing microphone input and previews the recorded clip. Audio metadata is linked to the corresponding note draft.
- **Optional enhancement:** Users can enable noise gating and trimming. Sensitivity is adjustable via a slider, and processing routines normalize audio, trim silence, and export a WAV blob for saving or download.
- **Export options:** Notes (with attached audio and metadata) can be exported to a user-selected folder via the File System Access API.

## Target selection and diagnostics
- **Player picker:** The Target dropdown defaults to auto-selection but allows manual targeting of detected players on the page.
- **Debug tools:** A debug console in the side panel logs message traffic, offers a quick "inject and retry" path if the content script is missing, and provides a manual export-folder chooser.

## Files of interest
- `manifest.json` — declares permissions, the side panel entry point, and the background service worker.
- `background.js` — configures the side panel to open on action clicks and on startup.
- `contentScript.js` — detects supported players, synchronizes playback state, and relays control commands between the side panel and page.
- `injectedBridge.js` — page-context bridge for YouTube iframe control and time polling.
- `sidepanel.html` / `sidepanel.js` / `styles.css` — user interface, playback controls, note-taking workflow, and audio tooling.
