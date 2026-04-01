import axios from "axios";

export const getYouTubeVideoDetails = async (videoId) => {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  const url = `https://www.googleapis.com/youtube/v3/videos`;

  const res = await axios.get(url, {
    params: {
      part: "snippet",
      id: videoId,
      key: API_KEY,
    },
  });

  if (!res.data.items.length) {
    throw new Error("Invalid video");
  }

  return res.data.items[0].snippet;
};