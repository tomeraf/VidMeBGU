// Get current tab and detect videos
async function detectVideos() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: 'detectVideos' }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById('videoList').innerHTML =
        '<div class="no-video">No video page</div>';
      return;
    }

    const videos = response?.videos || [];
    displayVideos(videos);
  });
}

function displayVideos(videos) {
  const videoList = document.getElementById('videoList');

  if (videos.length === 0) {
    videoList.innerHTML = '<div class="no-video">No video detected</div>';
    return;
  }

  // Just show a single download button for the first video
  const video = videos[0];

  videoList.innerHTML = '';

  // Show title if available
  if (video.title) {
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'font-weight: bold; margin-bottom: 12px; padding: 8px; background: #f0f0f0; border-radius: 4px; font-size: 13px;';
    titleDiv.textContent = video.title;
    videoList.appendChild(titleDiv);
  }

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'download-btn';
  downloadBtn.innerHTML = '⬇ Download Video';
  downloadBtn.onclick = () => downloadVideo(downloadBtn, video.url, video.title);

  videoList.appendChild(downloadBtn);
}

function downloadVideo(button, url, title) {
  button.classList.add('downloading');
  button.innerHTML = '⏳ Downloading...';
  button.disabled = true;

  chrome.runtime.sendMessage({
    action: 'download',
    url: url,
    title: title
  }, (response) => {
    if (response?.success) {
      button.classList.remove('downloading');
      button.classList.add('success');
      button.innerHTML = '✓ Downloaded!';
      setTimeout(() => {
        button.classList.remove('success');
        button.innerHTML = '⬇ Download Again';
        button.disabled = false;
      }, 2000);
    } else {
      button.classList.remove('downloading');
      button.classList.add('error');
      button.innerHTML = '✗ Failed';
      button.disabled = false;
      setTimeout(() => {
        button.classList.remove('error');
        button.innerHTML = '⬇ Download Video';
      }, 3000);
    }
  });
}

// Initialize
detectVideos();
