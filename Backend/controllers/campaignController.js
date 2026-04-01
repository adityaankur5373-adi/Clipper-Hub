import prisma from "../prisma/client.js";

/* ============================= */
/* CREATE CAMPAIGN FROM VERIFIED REQUEST */
/* ============================= */
export const createCampaignFromRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      totalBudget,
      ratePerMillion,
      type,
      allowedPlatforms,
      thumbnail,
      bannerImage,
      description,
      audioUrl,
      audioName,
      maxSubmissions,
      maxSubmissionsPerAccount,
      maxEarnings,
      maxEarningsPerPost
    } = req.body;

    /* ============================= */
    /* 🔍 GET REQUEST */
    /* ============================= */
    const request = await prisma.campaignRequest.findUnique({
      where: { id: id }
    });

    if (!request) {
      return res.status(404).json({
        message: "Campaign request not found"
      });
    }

    /* ============================= */
    /* ❌ ONLY APPROVED REQUEST */
    /* ============================= */
    if (request.status !== "APPROVED") {
      return res.status(400).json({
        message: "Request not approved"
      });
    }

    /* ============================= */
    /* ❌ PREVENT DUPLICATE */
    /* ============================= */
    const existing = await prisma.campaign.findFirst({
      where: {
        email: request.email,
        company: request.company,
        details: request.details
      }
    });

    if (existing) {
      return res.status(400).json({
        message: "Campaign already created"
      });
    }
    /* ============================= */
    /* ✅ VALIDATE PLATFORMS */
    /* ============================= */
    if (!Array.isArray(allowedPlatforms)) {
      return res.status(400).json({
        message: "allowedPlatforms must be array"
      });
    }

    /* ============================= */
    /* ✅ CREATE CAMPAIGN */
    /* ============================= */
    const campaign = await prisma.campaign.create({
      data: {
        name: request.company + " Campaign",
        email: request.email,
        company: request.company,
        details: request.details,
        totalBudget: totalBudget || 0,
        remainingBudget: totalBudget || 0,
        ratePerMillion: ratePerMillion || 0,
        type: type || "BRAND",
        allowedPlatforms,
        thumbnail,
        bannerImage,
       description,
        audioUrl,
        audioName,
        maxSubmissions: maxSubmissions || 200,
        maxSubmissionsPerAccount: maxSubmissionsPerAccount || 1,
        maxEarnings: maxEarnings || 0,
        maxEarningsPerPost: maxEarningsPerPost || 0,

        status: "ACTIVE"
      }
    });

    res.json({
      message: "Campaign created successfully",
      campaign
    });

  } catch (err) {
    console.error("CREATE CAMPAIGN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAllCampaigns = async (req, res) => {
  try {
    const { type, platform, page = 1, limit = 10 } = req.query;

    /* ============================= */
    /* VALIDATION */
    /* ============================= */

    const validTypes = ["MUSIC", "GAMING", "BRAND", "CLIP"];
    const validPlatforms = ["YOUTUBE", "INSTAGRAM"];

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid campaign type"
      });
    }

    if (platform && !validPlatforms.includes(platform)) {
      return res.status(400).json({
        message: "Invalid platform"
      });
    }

    /* ============================= */
    /* PAGINATION */
    /* ============================= */

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const skip = (pageNumber - 1) * pageSize;

    /* ============================= */
    /* BUILD FILTER */
    /* ============================= */
     const where = {
    status: "ACTIVE",
    remainingBudget: {
       gt: 0 // ✅ only campaigns with money left
     }
    };

    if (type) {
      where.type = type;
    }

    if (platform) {
      where.allowedPlatforms = {
        has: platform
      };
    }

    /* ============================= */
    /* FETCH DATA */
    /* ============================= */

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          company: true,
          thumbnail: true,
          bannerImage: true,
          type: true,
          allowedPlatforms: true,
          totalBudget: true,
          remainingBudget: true,
          ratePerMillion: true,
          createdAt: true
        }
      }),

      prisma.campaign.count({ where })
    ]);

    /* ============================= */
    /* FORMAT RESPONSE */
    /* ============================= */
    const formatted = campaigns.map((c) => {
      const used = c.totalBudget - c.remainingBudget;

      const progress = c.totalBudget
        ? (used / c.totalBudget) * 100
        : 0;

      return {
        ...c,
        progress: Number(progress.toFixed(2))
      };
    });

    /* ============================= */
    /* RESPONSE */
    /* ============================= */

    res.json({
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      campaigns: formatted
    });

  } catch (err) {
    console.error("GET CAMPAIGNS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    /* ============================= */
    /* 🔐 AUTH */
    /* ============================= */

    if (!req.user?.userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const userId = req.user.userId;

    /* ============================= */
    /* 📦 CAMPAIGN */
    /* ============================= */

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        details: true,
        description: true,
        thumbnail: true,
        bannerImage: true,
        totalBudget: true,
        remainingBudget: true,
        ratePerMillion: true,
        status: true, 
        allowedPlatforms: true,
        createdAt: true,
        // ✅ NEW FIELDS
        maxSubmissions: true,
        maxSubmissionsPerAccount: true,
        maxEarnings: true,
        maxEarningsPerPost: true
      }
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    /* ============================= */
    /* 📊 PROGRESS */
    /* ============================= */

    const used = campaign.totalBudget - campaign.remainingBudget;

    const progress = campaign.totalBudget
      ? (used / campaign.totalBudget) * 100
      : 0;

    /* ============================= */
    /* 👤 USER SUBMISSIONS */
    /* ============================= */

    const mySubmissions = await prisma.submission.findMany({
      where: {
        userId,
        campaignId: id
      },
      select: {
        id: true,
        videoUrl: true,
        views: true,
        earnings: true,
        payoutStatus: true,
        status: true,
        isVerified: true,
        isEligible: true
      }
    });

    const joined = mySubmissions.length > 0;

    /* ============================= */
    /* 📊 USER STATS */
    /* ============================= */

    let totalViews = 0;
    let totalEarnings = 0;

    mySubmissions.forEach((sub) => {
      // ✅ Only count valid submissions
      if (
        sub.status === "APPROVED" &&
        sub.isVerified &&
        sub.isEligible
      ) {
        totalViews += sub.views || 0;
        totalEarnings += sub.earnings || 0;
        }
    });

    // ✅ Apply maxEarnings (per user cap)
    if (campaign.maxEarnings > 0) {
      totalEarnings = Math.min(
        totalEarnings,
        campaign.maxEarnings
      );
    }

    /* ============================= */
    /* 🏆 LEADERBOARD */
    /* ============================= */

    const leaderboardRaw = await prisma.submission.groupBy({
      by: ["userId"],
      where: {
        campaignId: id,
        status: "APPROVED",
        isVerified: true,
        isEligible: true
      },
      _sum: {
        views: true,
        earnings: true
      },
      orderBy: {
        _sum: { views: "desc" }
      },
      take: 10
    });

    const leaderboard = await Promise.all(
      leaderboardRaw.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            name: true,
            avatar: true
          }
        });

        let totalEarnings = entry._sum.earnings || 0;

        // ✅ Apply user max cap
        if (campaign.maxEarnings > 0) {
          totalEarnings = Math.min(
            totalEarnings,
            campaign.maxEarnings
          );
        }

        return {
          rank: index + 1,
          user,
          totalViews: entry._sum.views || 0,
          totalEarnings
        };
      })
    );

    /* ============================= */
    /* RESPONSE */
    /* ============================= */

    res.json({
      campaign,
      progress,
      joined,

      myStats: {
        totalViews,
        totalEarnings
      },

      mySubmissions,
      leaderboard
    });

  } catch (err) {
    console.error("GET CAMPAIGN BY ID ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true
          }
        },
        socialAccount: {
          select: {
            platform: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const data = submissions.map((sub) => {
      return {
        submissionId: sub.id,
        campaignName: sub.campaign.name,
        videoUrl: sub.videoUrl,
        platform: sub.socialAccount?.platform,

        views: sub.views || 0,
        earnings: sub.earnings || 0, // ✅ CORRECT

        isEligible: sub.isEligible,
        isVerified: sub.isVerified,
        status: sub.status
      };
    });

    res.json({
      total: data.length,
      campaigns: data
    });

  } catch (err) {
    console.error("GET MY CAMPAIGNS ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};
