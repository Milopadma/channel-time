// WatchTimeData.tsx
import React from "react";

interface ChannelData {
  channelName: string;
  watchTime: number;
}

interface WatchTimeDataProps {
  watchTimeData: Record<string, number>;
}

const WatchTimeData: React.FC<WatchTimeDataProps> = ({ watchTimeData }) => {
  const sortedChannelData: ChannelData[] = Object.entries(watchTimeData)
    .map(([channelName, watchTime]) => ({ channelName, watchTime }))
    .sort((a, b) => b.watchTime - a.watchTime);

  const formatTime = (timeInMs: number) => {
    const hours = Math.floor(timeInMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h2>Watch Time by Channel</h2>
      <table>
        <thead>
          <tr>
            <th>Channel Name</th>
            <th>Watch Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedChannelData.map(({ channelName, watchTime }, index) => (
            <tr key={index}>
              <td>{channelName}</td>
              <td>{formatTime(watchTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchTimeData;
