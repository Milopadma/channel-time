function polling() {
  // console.log("polling");
  setTimeout(polling, 1000 * 30);
}

polling();

// background.ts
import { VideoInfo, WatchTimeData } from "./types";

let currentVideoInfo: VideoInfo | null = null;
let watchStartTime: number | null = null;

const watchTimeData: WatchTimeData = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "videoStarted") {
    getCurrentTab((tab) => {
      if (tab.url?.includes("youtube.com/watch")) {
        if (!tab.id) {
          return;
        }
        chrome.tabs.sendMessage(
          tab.id,
          { action: "getVideoInfo" },
          (videoInfo: VideoInfo) => {
            currentVideoInfo = videoInfo;
            watchStartTime = Date.now();
          }
        );
      }
    });
  } else if (message.action === "videoPaused") {
    if (currentVideoInfo && watchStartTime) {
      const watchDuration = Date.now() - watchStartTime;
      const channelName = currentVideoInfo.channelName;
      if (!channelName) {
        return;
      }
      if (watchTimeData[channelName]) {
        watchTimeData[channelName] += watchDuration;
      } else {
        watchTimeData[channelName] = watchDuration;
      }
      chrome.storage.sync.set({ watchTimeData });
      currentVideoInfo = null;
      watchStartTime = null;
    }
  }
});

function getCurrentTab(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    callback(tabs[0]);
  });
}

// background.ts
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "watch-time-data") {
    port.onMessage.addListener((message) => {
      console.log(message);
    });

    // Send the watch time data to the injected script
    port.postMessage(watchTimeData);
  }
});
