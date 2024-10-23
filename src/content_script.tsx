// content-script.ts
console.log("Content script loaded");

let stopPolling = false;
let currentVideoInfo: {
  channelName: string | null;
  videoTitle: string | null;
} = {
  channelName: null,
  videoTitle: null,
};
let watchStartTime: number | null = null;
let watchDuration: number = 0;

let channelTotalWatchTimeS: { [key: string]: number } = {};

function getVideoData() {
  const videoTitleElement = document.querySelector(
    "h2.slim-video-information-title span"
  );
  const videoTitle = videoTitleElement?.textContent;

  const channelName = document.querySelector(
    "#channel-name .ytd-channel-name .ytd-channel-name #text a"
  )?.textContent;

  console.log("getVideoInfo", videoTitle, channelName);

  if (!videoTitle || !channelName) {
    setTimeout(() => {
      console.log("Retrying to get video data");
      getVideoData();
    }, 1000);
  }

  return { channelName, videoTitle };
}

const port = chrome.runtime.connect({ name: "watch-time-data" });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoInfo") {
    console.log("Received getVideoInfo message");
    const { channelName, videoTitle } = getVideoData();
    sendResponse({ channelName, videoTitle });
  }
});

const videoPlayer = document.querySelector("video");

videoPlayer?.addEventListener("loadeddata", () => {
  stopPolling = false;
  console.log("Video loaded and ready to play");
  watchStartTime = Date.now();
});

videoPlayer?.addEventListener("pause", () => {
  console.log("Video paused");
  stopPolling = true;
  console.log(watchStartTime, currentVideoInfo.channelName);
  if (watchStartTime && currentVideoInfo.channelName) {
    watchDuration = (Date.now() - watchStartTime) / 6000; // Convert to minute;
    port.postMessage({
      action: "updateWatchTimeData",
      payload: {
        channelName: currentVideoInfo.channelName,
        watchTime: Math.round(watchDuration * 100) / 100,
      },
    });
  }
});

const polling = () => {
  if (stopPolling) {
    return;
  }
  setInterval(() => {
    // check if the video is paused/playing
    if (videoPlayer?.paused) {
      return;
    }
    console.log("Polling");
    if (currentVideoInfo.channelName) {
      channelTotalWatchTimeS[currentVideoInfo.channelName] =
        (channelTotalWatchTimeS[currentVideoInfo.channelName] || 0) + 1;
      port.postMessage({
        action: "updateWatchTimeData",
        payload: {
          channelName: currentVideoInfo.channelName,
          watchTime: channelTotalWatchTimeS[currentVideoInfo.channelName],
        },
      });
    }
  }, 1000);
};

polling();
