// Track active animations per tab
const animatingTabs = new Map();

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle download requests
  if (request.action === 'download') {
    const url = request.url;
    let filename;

    if (request.title) {
      // Clean the title for use as filename
      const cleanTitle = request.title
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 100); // Limit length
      filename = `${cleanTitle}.mp4`;
    } else {
      // Fallback to timestamp or provided filename
      filename = request.filename || `video_${Date.now()}.mp4`;
    }

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Download started:', downloadId);
        sendResponse({ success: true, downloadId: downloadId });
      }
    });

    return true; // Keep message channel open for async response
  }

  // Handle video detection notification
  if (request.action === 'videoDetected') {
    const tabId = sender.tab.id;

    // Start icon animation if not already running
    if (!animatingTabs.has(tabId)) {
      startIconAnimation(tabId);
    }

    // Update title
    chrome.action.setTitle({
      tabId: tabId,
      title: `📥 Video ready to download! Click here!`
    });
  }
});

// Animate icon by cycling through colored versions
function startIconAnimation(tabId) {
  let frame = 0;
  const iconSets = [
    { 16: 'icons/icon16_blue.png', 48: 'icons/icon48_blue.png', 128: 'icons/icon128_blue.png' },
    { 16: 'icons/icon16_green.png', 48: 'icons/icon48_green.png', 128: 'icons/icon128_green.png' },
    { 16: 'icons/icon16_orange.png', 48: 'icons/icon48_orange.png', 128: 'icons/icon128_orange.png' },
    { 16: 'icons/icon16_red.png', 48: 'icons/icon48_red.png', 128: 'icons/icon128_red.png' },
    { 16: 'icons/icon16_orange.png', 48: 'icons/icon48_orange.png', 128: 'icons/icon128_orange.png' },
    { 16: 'icons/icon16_green.png', 48: 'icons/icon48_green.png', 128: 'icons/icon128_green.png' }
  ];

  const intervalId = setInterval(() => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        clearInterval(intervalId);
        animatingTabs.delete(tabId);
        // Reset to default icon
        chrome.action.setIcon({
          tabId: tabId,
          path: {
            16: 'icons/icon16.png',
            48: 'icons/icon48.png',
            128: 'icons/icon128.png'
          }
        });
        return;
      }

      const iconSet = iconSets[frame % iconSets.length];

      chrome.action.setIcon({
        tabId: tabId,
        path: iconSet
      });

      frame++;
    });
  }, 400); // Change icon every 400ms

  animatingTabs.set(tabId, intervalId);
}

// Stop animation and reset icon when tab is changed
chrome.tabs.onActivated.addListener((activeInfo) => {
  animatingTabs.forEach((intervalId, tabId) => {
    if (tabId !== activeInfo.tabId) {
      clearInterval(intervalId);
      animatingTabs.delete(tabId);
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      });
    }
  });
});

// Clear animation when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (animatingTabs.has(tabId)) {
    clearInterval(animatingTabs.get(tabId));
    animatingTabs.delete(tabId);
  }
});
