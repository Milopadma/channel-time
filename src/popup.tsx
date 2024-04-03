// popup.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { WatchTimeData } from "./types";

const Popup: React.FC = () => {
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({});

  useEffect(() => {
    console.log("Popup component mounted");
    const port = chrome.runtime.connect({ name: "watch-time-data" });

    port.onMessage.addListener((data: WatchTimeData) => {
      setWatchTimeData(data);
    });

    port.postMessage({ action: "getWatchTimeData" });

    // Listen for storage changes and update the watchTimeData state
    chrome.storage.sync.get("watchTimeData", (data) => {
      setWatchTimeData(data.watchTimeData || {});
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.watchTimeData) {
        setWatchTimeData(changes.watchTimeData.newValue);
      }
    });
  }, []);

  return (
    <div>
      <h2>Watch Time by Channel</h2>
      <table>
        <thead>
          <tr>
            <th>Channel Name</th>
            <th>Watch Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(watchTimeData).map(
            ([channelName, watchTime], index) => (
              <tr key={index}>
                <td>{channelName}</td>
                <td>{watchTime}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
