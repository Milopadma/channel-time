import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import WatchTimeData from "./watchtimedata";

const WatchTimeContext = React.createContext<Record<string, number>>({});

const Popup = ({
  watchTimeData,
}: {
  watchTimeData: Record<string, number>;
}) => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: "5px" }}
      >
        count up
      </button>
      <div>hello world</div>
      <div> {watchTimeData.toString()} </div>
      {
        <WatchTimeContext.Provider value={watchTimeData}>
          <div> {watchTimeData.toString()} </div>
        </WatchTimeContext.Provider>
      }
      <WatchTimeData watchTimeData={watchTimeData} />
      <button onClick={changeBackground}>change background</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

const port = chrome.runtime.connect({ name: "watch-time-data" });

port.onMessage.addListener((watchTimeData) => {
  root.render(
    <React.StrictMode>
      <Popup watchTimeData={watchTimeData} />
    </React.StrictMode>
  );
});

// Add a message to the background script to request the watch time data
port.postMessage({ action: "getWatchTimeData" });
