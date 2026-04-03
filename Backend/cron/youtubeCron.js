import cron from "node-cron";
import prisma from "../prisma/client.js";
import { getYouTubeVideoDetails } from "../utils/youtube.js";


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
    try {
      if (sub.socialAccount.platform !== "YOUTUBE") continue;

      const stats = await getYouTubeVideoDetails(sub.videoId);
     
         if (!stats) {
  console.log("❌ No stats for:", sub.videoId);
  continue;
}
      const { views, likes, comments, shares } = stats;
           
      const previousViews = sub.views || 0;

      // ❌ prevent decreasing views
      if (views < previousViews) continue;

      // ❌ prevent duplicate update
      if (views === previousViews) continue;

      const engagementRate =
        views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

      // 🔥 Anti-bot
      if (engagementRate < 0.1) continue;

      const growth = views - previousViews;

      // 🔥 spike protection
      if (growth > 100000) continue;

      /* ============================= */
      /* EARNINGS */
      /* ============================= */

      let raw =
        (views / 1_000_000) * sub.campaign.ratePerMillion;

      raw = Number(raw.toFixed(2));

      if (sub.campaign.maxEarningsPerPost > 0) {
        raw = Math.min(raw, sub.campaign.maxEarningsPerPost);
      }

      const old = sub.earnings || 0;
      const diff = raw - old;

      // ❌ no new earnings
      if (diff <= 0) continue;

      let payable = Math.min(diff, sub.campaign.remainingBudget);

      // ❌ no campaign budget
      if (payable <= 0) continue;

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

      if (sub.campaign.maxEarnings > 0) {
        const remainingUserLimit =
          sub.campaign.maxEarnings - totalEarned;

        // 🔥 FIX: prevent negative limit
        if (remainingUserLimit <= 0) continue;

        payable = Math.min(payable, remainingUserLimit);
      }

      // 🔥 FINAL SAFETY (VERY IMPORTANT)
      if (payable <= 0) continue;

      /* ============================= */
      /* TRANSACTION */
      /* ============================= */

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

    } catch (err) {
      console.error(`❌ Error processing submission ${sub.id}:`, err);
      continue; // don't break loop
    }
  }

  console.log("✅ YouTube Cron Done");
});