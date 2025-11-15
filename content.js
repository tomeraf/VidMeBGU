// Detect video elements on the page
function detectVideos() {
  const videos = [];
  const foundUrls = new Set();

  // ONLY find <video> elements
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach((video, index) => {
    const src = video.src || video.currentSrc;
    if (src && !src.startsWith('blob:') && !foundUrls.has(src)) {
      foundUrls.add(src);
      videos.push({
        type: 'video',
        url: src,
        element: video,
        title: getVideoTitle(video),
        index: videos.length
      });
    }

    // Check source tags within video
    const sources = video.querySelectorAll('source');
    sources.forEach((source) => {
      const srcUrl = source.src;
      if (srcUrl && !srcUrl.startsWith('blob:') && !foundUrls.has(srcUrl)) {
        foundUrls.add(srcUrl);
        videos.push({
          type: 'video',
          url: srcUrl,
          element: video,
          title: getVideoTitle(video),
          index: videos.length
        });
      }
    });
  });

  return videos;
}

// Try to find a title for the video from nearby elements
function getVideoTitle(videoElement) {
  // Look for h3 above the video (BGU Moodle pattern)
  let current = videoElement;
  while (current && current.parentElement) {
    current = current.parentElement;
    const h3 = current.querySelector('h3');
    if (h3 && h3.textContent.trim()) {
      return h3.textContent.trim();
    }
  }

  // Fallback: check document title
  if (document.title && document.title !== 'Moodle') {
    return document.title;
  }

  return null;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectVideos') {
    const videos = detectVideos();
    sendResponse({ videos: videos });
  }
  return true;
});

// Notify background script when video is detected
function notifyVideoDetected() {
  const videos = detectVideos();
  if (videos.length > 0) {
    chrome.runtime.sendMessage({
      action: 'videoDetected',
      count: videos.length
    });
  }
}

// Check for videos on page load and periodically
window.addEventListener('load', () => {
  setTimeout(notifyVideoDetected, 1000);
});

// Check periodically for dynamically loaded videos
setInterval(notifyVideoDetected, 3000);
