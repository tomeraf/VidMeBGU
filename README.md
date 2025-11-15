# Video Downloader Chrome Extension

Chrome extension to detect and download videos from websites.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this project folder

## Usage

1. Navigate to any webpage with videos
2. Click the extension icon to see detected videos
3. Click "Download" to save the video
4. Download buttons also appear as overlays on video elements

## Features

- Automatic video detection
- Download button overlay on videos
- Popup interface to view all detected videos
- Support for direct video URLs (not blob URLs)

## Note

This extension can only download videos with direct URLs. Streaming videos using blob URLs or DRM protection cannot be downloaded.
