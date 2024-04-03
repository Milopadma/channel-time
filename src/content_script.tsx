// content-script.ts
console.log("Content script loaded");
let currentVideoInfo: {
  channelName: string | null;
  videoTitle: string | null;
} = {
  channelName: null,
  videoTitle: null,
};
let watchStartTime: number | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoInfo") {
    console.log("Received getVideoInfo message");
    const videoTitle = document.querySelector(
      "yt-formatted-string.style-scope.ytd-watch-metadata"
    )?.textContent;
    const channelName = document.querySelector(
      "ytd-video-owner-renderer.watch-metadata-refresh a"
    )?.textContent;
    if (!videoTitle || !channelName) {
      sendResponse({ channelName: "not found", videoTitle: "not found" });
      return;
    }
    currentVideoInfo = { channelName, videoTitle };
    sendResponse({ channelName, videoTitle });
  }
});

const videoPlayer = document.querySelector("video");
videoPlayer?.addEventListener("play", () => {
  watchStartTime = Date.now();
});

videoPlayer?.addEventListener("pause", () => {
  if (watchStartTime && currentVideoInfo.channelName) {
    const watchDuration = Date.now() - watchStartTime;
    chrome.runtime.sendMessage({
      action: "updateWatchTimeData",
      payload: {
        channelName: currentVideoInfo.channelName,
        watchTime: watchDuration,
      },
    });
    watchStartTime = null;
  }
});
