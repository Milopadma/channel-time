// background.ts
console.log("Background script loaded");
import { WatchTimeData } from "./types";

const watchTimeData: WatchTimeData = {};

chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to", port.name);
  if (port.name === "watch-time-data") {
    console.log("Connected to watch-time-data port");
    port.onMessage.addListener((message) => {
      if (message.action === "getWatchTimeData") {
        port.postMessage(watchTimeData);
      } else if (message.action === "updateWatchTimeData") {
        const { channelName, watchTime } = message.payload;
        console.log(
          "Updating watch time data for channel:",
          channelName,
          "with time:",
          watchTime
        );
        watchTimeData[channelName] = watchTime;
        chrome.storage.sync.set({ watchTimeData });
        console.log("Updated watch time data:", watchTimeData);
      }
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("youtube.com/watch")
  ) {
    chrome.tabs.sendMessage(tabId, { action: "getVideoInfo" });
  }
});
