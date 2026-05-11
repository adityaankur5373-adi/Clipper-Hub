import axios from "axios";

export const getYouTubeVideoDetails = async (videoId) => {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  const url = `https://www.googleapis.com/youtube/v3/videos`;

  const res = await axios.get(url, {
    params: {
      part: "statistics,snippet", 
      id: videoId,
      key: API_KEY,
    },
  });

  if (!res.data.items.length) {
    throw new Error("Invalid video");
  }

  const video = res.data.items[0];

  const stats = video.statistics;
  const snippet = video.snippet;

  return {
    channelId: snippet.channelId, 
    views: Number(stats.viewCount) || 0,
    likes: Number(stats.likeCount) || 0,
    comments: Number(stats.commentCount) || 0,
    shares: 0
  };
};