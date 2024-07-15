import { format, fromUnixTime } from "date-fns";

export const extractITweetdFromUrl = (url: string): string | null => {
  const regex = /^https:\/\/(x\.com|twitter\.com)\/[^\/]+\/status\/(\d+)$/;
  const match = url.match(regex);
  if (match) {
      return match[2];
  } else {
      return null;
  }
}
export const formatTimestamp = (timestamp: number): string => format(fromUnixTime(timestamp), "yyyy-MM-dd HH:mm:ss");

export const formatTxHash = (txHash: string): string => `${txHash.substring(0, 22)}...${txHash.substring(txHash.length - 22)}`