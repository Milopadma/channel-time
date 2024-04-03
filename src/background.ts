// background.ts
import { WatchTimeData } from "./types";

const watchTimeData: WatchTimeData = {
  "Channel A": 10000,
  "Channel B": 20000,
  "Channel C": 15000,
};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "watch-time-data") {
    port.onMessage.addListener((message) => {
      if (message.action === "getWatchTimeData") {
        port.postMessage(watchTimeData);
      }
    });
  }
});
