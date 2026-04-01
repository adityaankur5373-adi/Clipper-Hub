import prisma from "../prisma/client.js";
import cron from "node-cron";
import { getYouTubeVideoDetails } from "../utils/youtube.js";
export const updateInstagramStats = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { views, likes, comments, shares } = req.body;

    if (views === undefined) {
      return res.status(400).json({ message: "Views are required" });
    }

    const sub = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        campaign: true,
        socialAccount: true
      }
    });

    if (!sub) {
      return res.status(404).json({ message: "Submission not found" });
    }

    /* ============================= */
    /* VALIDATIONS */
    /* ============================= */

    if (sub.socialAccount.platform !== "INSTAGRAM") {
      return res.status(400).json({
        message: "Not an Instagram submission"
      });
    }

    if (
      sub.status !== "APPROVED" ||
      !sub.isVerified ||
      !sub.isEligible
    ) {
      return res.status(400).json({
        message: "Submission not eligible for earnings"
      });
    }

    const previousViews = sub.views || 0;

    // ❌ prevent decreasing views
    if (views < previousViews) {
      return res.status(400).json({
        message: "Views cannot decrease"
      });
    }

    // ❌ prevent duplicate update
    if (views === previousViews) {
      return res.json({
        message: "No new views update"
      });
    }

    const v = views || 0;
    const l = likes || 0;
    const c = comments || 0;
    const s = shares || 0;

    /* ============================= */
    /* ENGAGEMENT */
    /* ============================= */

    const engagementRate =
      v > 0 ? ((l + c + s) / v) * 100 : 0;

    // 🔥 Anti-bot: low engagement
    if (engagementRate < 0.5) {
      await prisma.submission.update({
        where: { id: sub.id },
        data: { isEligible: false }
      });

      return res.status(400).json({
        message: "Low engagement detected → marked ineligible"
      });
    }

    /* ============================= */
    /* SPIKE DETECTION */
    /* ============================= */

    const growth = v - previousViews;

    if (growth > 100000) {
      return res.status(400).json({
        message: "Suspicious spike detected"
      });
    }

    /* ============================= */
    /* EARNINGS */
    /* ============================= */

    let raw =
      (v / 1_000_000) * sub.campaign.ratePerMillion;

    // ✅ round earnings
    raw = Number(raw.toFixed(2));

    if (sub.campaign.maxEarningsPerPost > 0) {
      raw = Math.min(raw, sub.campaign.maxEarningsPerPost);
    }

    const oldEarnings = sub.earnings || 0;
    const diff = raw - oldEarnings;

    if (diff <= 0) {
      return res.json({ message: "No new earnings" });
    }

    let payable = Math.min(diff, sub.campaign.remainingBudget);

    if (payable <= 0) {
      return res.status(400).json({
        message: "Campaign budget exhausted"
      });
    }

    /* ============================= */
    /* MAX PER USER */
    /* ============================= */

    const userTotal = await prisma.submission.aggregate({
      where: {
        userId: sub.userId,
        campaignId: sub.campaignId
      },
      _sum: { earnings: true }
    });

    const totalEarned = userTotal._sum.earnings || 0;

    let finalPayable = payable;

    if (sub.campaign.maxEarnings > 0) {
      const remainingUserLimit =
        sub.campaign.maxEarnings - totalEarned;

      finalPayable = Math.min(payable, remainingUserLimit);
    }

    if (finalPayable <= 0) {
      return res.status(400).json({
        message: "User reached max earnings limit"
      });
    }

    /* ============================= */
    /* TRANSACTION */
    /* ============================= */

    await prisma.$transaction([
      prisma.submission.update({
        where: { id: sub.id },
        data: {
          views: v,
          likes: l,
          comments: c,
          shares: s,
          engagementRate,
          earnings: {
            increment: finalPayable
          }
        }
      }),

      prisma.user.update({
        where: { id: sub.userId },
        data: {
          balance: {
            increment: finalPayable
          }
        }
      }),

      prisma.campaign.update({
        where: { id: sub.campaignId },
        data: {
          remainingBudget: {
            decrement: finalPayable
          }
        }
      })
    ]);

    /* ============================= */
    /* CLOSE CAMPAIGN */
    /* ============================= */

    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: sub.campaignId }
    });

    if (updatedCampaign.remainingBudget <= 0) {
      await prisma.campaign.update({
        where: { id: sub.campaignId },
        data: { status: "COMPLETED" }
      });
    }

    res.json({
      message: "Instagram stats updated",
      earned: finalPayable,
      engagementRate
    });

  } catch (err) {
    console.error("INSTAGRAM UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
    

cron.schedule("*/10 * * * *", async () => {
  console.log("🚀 Running YouTube Cron...");

  const submissions = await prisma.submission.findMany({
    where: {
      status: "APPROVED",
      isVerified: true,
      isEligible: true,
      videoId: { not: null }
    },
    include: {
      campaign: true,
      socialAccount: true
    }
  });

  for (const sub of submissions) {
    if (sub.socialAccount.platform !== "YOUTUBE") continue;

    const stats = await getYouTubeVideoDetails(sub.videoId);
    if (!stats) continue;

    const { views, likes, comments, shares } = stats;

    const previousViews = sub.views || 0;

    // ❌ prevent decreasing views
    if (views < previousViews) continue;

    // ❌ prevent duplicate update
    if (views === previousViews) continue;

    const engagementRate =
      views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

    // 🔥 Anti-bot
    if (engagementRate < 0.5) continue;

    const growth = views - previousViews;

    if (growth > 100000) continue;

    let raw =
      (views / 1_000_000) * sub.campaign.ratePerMillion;

    // ✅ round earnings
    raw = Number(raw.toFixed(2));

    if (sub.campaign.maxEarningsPerPost > 0) {
      raw = Math.min(raw, sub.campaign.maxEarningsPerPost);
    }

    const old = sub.earnings || 0;
    const diff = raw - old;

    if (diff <= 0) continue;

    let payable = Math.min(diff, sub.campaign.remainingBudget);

    if (payable <= 0) continue;

    // ✅ max per user
    const userTotal = await prisma.submission.aggregate({
      where: {
        userId: sub.userId,
        campaignId: sub.campaignId
      },
      _sum: { earnings: true }
    });

    const totalEarned = userTotal._sum.earnings || 0;

    if (sub.campaign.maxEarnings > 0) {
      const remainingUserLimit =
        sub.campaign.maxEarnings - totalEarned;
      payable = Math.min(payable, remainingUserLimit);
    }
    if (payable <= 0) continue;

    await prisma.$transaction([
      prisma.submission.update({
        where: { id: sub.id },
        data: {
          views,
          likes,
          comments,
          shares,
          engagementRate,
          earnings: {
            increment: payable
          }
        }
      }),

      prisma.user.update({
        where: { id: sub.userId },
        data: {
          balance: {
            increment: payable
          }
        }
      }),

      prisma.campaign.update({
        where: { id: sub.campaignId },
        data: {
          remainingBudget: {
            decrement: payable
          }
        }
      })
    ]);

    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: sub.campaignId }
    });

    if (updatedCampaign.remainingBudget <= 0) {
      await prisma.campaign.update({
        where: { id: sub.campaignId },
        data: { status: "COMPLETED" }
      });
    }
  }
  console.log("✅ YouTube Cron Done");
});