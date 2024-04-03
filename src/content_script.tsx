chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

// content-script.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoInfo") {
    const videoTitle = document.querySelector("#info .title")?.textContent;
    const channelName = document.querySelector(
      "#text.ytd-channel-name a"
    )?.textContent;
    sendResponse({ videoTitle, channelName });
  }
});

const videoPlayer = document.querySelector("video");
videoPlayer?.addEventListener("play", () => {
  chrome.runtime.sendMessage({ action: "videoStarted" });
});

videoPlayer?.addEventListener("pause", () => {
  chrome.runtime.sendMessage({ action: "videoPaused" });
});
