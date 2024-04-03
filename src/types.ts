// types.ts
export interface VideoInfo {
  videoTitle: string | null;
  channelName: string | null;
}

export interface WatchTimeData {
  [channelName: string]: number;
}
