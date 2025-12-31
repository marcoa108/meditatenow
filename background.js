// Open the extension in the side panel for the CURRENT WINDOW when the user
// clicks the extension icon.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Also set behavior on startup (covers updates / browser restarts)
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});