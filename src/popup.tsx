// popup.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { WatchTimeData } from "./types";

const Popup: React.FC = () => {
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({});

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "watch-time-data" });

    port.onMessage.addListener((data: WatchTimeData) => {
      setWatchTimeData(data);
    });

    port.postMessage({ action: "getWatchTimeData" });
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
