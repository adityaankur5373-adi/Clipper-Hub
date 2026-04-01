import prisma from "../prisma/client.js";
import { getYouTubeVideoDetails } from "../utils/youtube.js";
/* ============================= */
/* 🔧 HELPER FUNCTIONS */
/* ============================= */

// 🎥 YouTube ID extractor
const extractYouTubeId = (url) => {
  const match = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

// 📸 Instagram extractor
const extractInstagramId = (url) => {
  const match = url.match(/instagram\.com\/reel\/([^/?]+)/);
  return match ? match[1] : null;
};
export const submitVideo = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const { campaignId, videoUrl } = req.body;

    /* ============================= */
    /* 1. VALIDATION */
    /* ============================= */

    if (!campaignId || !videoUrl) {
      return res.status(400).json({
        message: "campaignId and videoUrl are required"
      });
    }

    /* ============================= */
    /* 2. DETECT PLATFORM */
    /* ============================= */

    let platform = null;
    let videoId = null;
    let mediaId = null;

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      platform = "YOUTUBE";
      videoId = extractYouTubeId(videoUrl);

      if (!videoId) {
        return res.status(400).json({
          message: "Invalid YouTube URL"
        });
      }
    } else if (videoUrl.includes("instagram.com")) {
      platform = "INSTAGRAM";
      mediaId = extractInstagramId(videoUrl);

      if (!mediaId) {
        return res.status(400).json({
          message: "Invalid Instagram Reel URL"
        });
      }
    } else {
      return res.status(400).json({
        message: "Unsupported platform URL"
      });
    }

    /* ============================= */
    /* 3. GET CAMPAIGN */
    /* ============================= */

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign || campaign.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Campaign not active or not found"
      });
    }

    /* ============================= */
    /* 4. CHECK PLATFORM ALLOWED */
    /* ============================= */

    if (!campaign.allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        message: `Allowed platforms: ${campaign.allowedPlatforms.join(", ")}`
      });
    }

    /* ============================= */
    /* 5. GET VERIFIED SOCIAL ACCOUNT */
    /* ============================= */
     /* ============================= */
/* 🔒 YOUTUBE CHANNEL VERIFY */
/* ============================= */


    const social = await prisma.socialAccount.findFirst({
      where: {
        userId,
        platform,
        verified: true
      }
    });
     
    if (!social) {
      return res.status(400).json({
        message: `Verify your ${platform} account first`
      });
    }
      /* ============================= */
/* 🔒 YOUTUBE CHANNEL VERIFY */
/* ============================= */

if (platform === "YOUTUBE") {
  const videoDetails = await getYouTubeVideoDetails(videoId);

  const videoChannelId = videoDetails.channelId;

  // 🔥 CHECK MATCH
  if (social.channelId && social.channelId !== videoChannelId) {
    return res.status(400).json({
      message: "Video does not belong to your YouTube channel"
    });
  }
}
    const socialAccountId = social.id;

    /* ============================= */
    /* 6. MAX SUBMISSIONS (USER) */
    /* ============================= */

    const userCount = await prisma.submission.count({
      where: { userId, campaignId }
    });

    if (userCount >= campaign.maxSubmissions) {
      return res.status(400).json({
        message: "Max submissions reached"
      });
    }

    /* ============================= */
    /* 7. MAX SUBMISSIONS (ACCOUNT) */
    /* ============================= */

    const accountCount = await prisma.submission.count({
      where: { campaignId, socialAccountId }
    });

    if (accountCount >= campaign.maxSubmissionsPerAccount) {
      return res.status(400).json({
        message: "Account submission limit reached"
      });
    }

    /* ============================= */
    /* 8. PREVENT DUPLICATE CONTENT */
    /* ============================= */

    const duplicate = await prisma.submission.findFirst({
      where: {
        campaignId,
        OR: [
          { videoUrl },
          videoId ? { videoId } : undefined,
          mediaId ? { mediaId } : undefined
        ].filter(Boolean)
      }
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Duplicate video submission"
      });
    }
    /* ============================= */
    /* 9. CREATE SUBMISSION */
    /* ============================= */

    const submission = await prisma.submission.create({
      data: {
        userId,
        campaignId,
        socialAccountId,
        videoUrl,
        videoId,
        mediaId,
        status: "PENDING",
        isVerified: false,
        isEligible: false
      }
    });

    /* ============================= */
    /* RESPONSE */
    /* ============================= */

    res.status(201).json({
      message: "Submission sent for review",
      submission
    });

  } catch (err) {
    console.error("SUBMIT VIDEO ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// controllers/submission.controller.js



export const deleteMySubmission = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { submissionId } = req.params;

    // 🔍 Find submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // ❌ Check ownership
    if (submission.userId !== userId) {
      return res.status(403).json({
        message: "Not your submission",
      });
    }

    // ❌ Block verified
    if (submission.isVerified) {
      return res.status(400).json({
        message: "Cannot delete verified submission",
      });
    }

    // 🔥 Delete
    await prisma.submission.delete({
      where: { id: submissionId },
    });

    res.json({
      message: "Submission deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting submission",
    });
  }
};