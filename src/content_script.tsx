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
const port = chrome.runtime.connect({ name: "watch-time-data" });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoInfo") {
    console.log("Received getVideoInfo message");

    const videoTitleElement = document.querySelector(
      "h2.slim-video-information-title span"
    );
    const videoTitle = videoTitleElement?.textContent;

    const channelNameElement = document.querySelector(
      "a.slim-owner-icon-and-title"
    );
    const channelName = channelNameElement?.getAttribute("aria-label");

    console.log("getVideoInfo", videoTitle, channelName);

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
  console.log("Video playing");
  watchStartTime = Date.now();
});

videoPlayer?.addEventListener("pause", () => {
  console.log("Video paused");
  console.log(watchStartTime, currentVideoInfo.channelName);
  if (watchStartTime && currentVideoInfo.channelName) {
    const watchDuration = Date.now() - watchStartTime;
    port.postMessage({
      action: "updateWatchTimeData",
      payload: {
        channelName: currentVideoInfo.channelName,
        watchTime: watchDuration,
      },
    });
    watchStartTime = null;
  }
});
