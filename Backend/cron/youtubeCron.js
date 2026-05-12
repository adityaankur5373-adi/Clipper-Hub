import cron from "node-cron";
import prisma from "../prisma/client.js";
import { getYouTubeVideoDetails } from "../utils/youtube.js";

/* ========================================= */
/* YOUTUBE CRON */
/* Runs every 10 minutes */
/* ========================================= */

cron.schedule("*/10 * * * *", async () => {

  console.log("🚀 Running YouTube Cron...");

  try {

    /* ========================================= */
    /* FETCH VALID SUBMISSIONS */
    /* ========================================= */

    const submissions = await prisma.submission.findMany({
      where: {
        status: "APPROVED",
        isVerified: true,
        isEligible: true,
        videoId: {
          not: null
        }
      },

      include: {
        campaign: true,
        socialAccount: true
      }
    });

    /* ========================================= */
    /* LOOP THROUGH SUBMISSIONS */
    /* ========================================= */

    for (const sub of submissions) {

      try {

        /* ========================================= */
        /* ONLY YOUTUBE */
        /* ========================================= */

        if (sub.socialAccount.platform !== "YOUTUBE") {
          continue;
        }

        /* ========================================= */
        /* GET LATEST VIDEO STATS */
        /* ========================================= */

        const stats = await getYouTubeVideoDetails(sub.videoId);

        if (!stats) {
          console.log("❌ No stats found:", sub.videoId);
          continue;
        }

        const {
          views,
          likes,
          comments,
          shares
        } = stats;

        /* ========================================= */
        /* PREVIOUS SAVED VIEWS */
        /* ========================================= */

        const previousViews = sub.views || 0;

        /* ========================================= */
        /* PREVENT VIEW DROP */
        /* ========================================= */

        if (views < previousViews) {
          console.log("⚠️ Views decreased");
          continue;
        }

        /* ========================================= */
        /* NO NEW VIEWS */
        /* ========================================= */

        if (views === previousViews) {
          continue;
        }

        /* ========================================= */
        /* ENGAGEMENT RATE */
        /* ========================================= */

        const engagementRate =
          views > 0
            ? (
                (likes + comments + shares) / views
              ) * 100
            : 0;

        /* ========================================= */
        /* ANTI BOT CHECK */
        /* ========================================= */

        if (engagementRate < 0.1) {
          console.log("⚠️ Low engagement");
          continue;
        }

        /* ========================================= */
        /* VIEW GROWTH */
        /* ========================================= */

        const growth = views - previousViews;

        /* ========================================= */
        /* SUSPICIOUS GROWTH CHECK */
        /* ========================================= */

        if (growth > 5000000) {
          console.log("⚠️ Suspicious spike:", growth);
          continue;
        }

        /* ========================================= */
        /* NEW VIEWS */
        /* ========================================= */

        const newViews = growth;

        /* ========================================= */
        /* CALCULATE NEW EARNING */
        /* ========================================= */

        let newEarning =
          (newViews / 1_000_000) *
          sub.campaign.ratePerMillion;

        /* ========================================= */
        /* ROUND TO 2 DECIMALS */
        /* ========================================= */

        newEarning = Number(
          newEarning.toFixed(2)
        );

        /* ========================================= */
        /* INVALID NUMBER CHECK */
        /* ========================================= */

        if (isNaN(newEarning)) {
          console.log("❌ Invalid earning");
          continue;
        }

        /* ========================================= */
        /* OLD EARNINGS */
        /* ========================================= */

        const oldEarnings =
          sub.earnings || 0;

        /* ========================================= */
        /* TOTAL EARNINGS AFTER UPDATE */
        /* ========================================= */

        let totalEarnings =
          oldEarnings + newEarning;

        /* ========================================= */
        /* MAX PER POST LIMIT */
        /* ========================================= */

        if (
          sub.campaign.maxEarningsPerPost > 0
        ) {

          totalEarnings = Math.min(
            totalEarnings,
            sub.campaign.maxEarningsPerPost
          );
        }

        /* ========================================= */
        /* ACTUAL PAYABLE */
        /* ========================================= */

        let payable = Number(
          (
            totalEarnings - oldEarnings
          ).toFixed(2)
        );

        /* ========================================= */
        /* NO PAYABLE */
        /* ========================================= */

        if (payable <= 0) {
          continue;
        }

        /* ========================================= */
        /* USER TOTAL EARNINGS */
        /* ========================================= */

        const userTotal =
          await prisma.submission.aggregate({
            where: {
              userId: sub.userId,
              campaignId: sub.campaignId
            },

            _sum: {
              earnings: true
            }
          });

        const totalEarned =
          userTotal._sum.earnings || 0;

        /* ========================================= */
        /* MAX USER LIMIT */
        /* ========================================= */

        if (
          sub.campaign.maxEarnings > 0
        ) {

          const remainingUserLimit =
            sub.campaign.maxEarnings -
            totalEarned;

          if (remainingUserLimit <= 0) {
            continue;
          }

          payable = Math.min(
            payable,
            remainingUserLimit
          );
        }

        /* ========================================= */
        /* FINAL SAFETY */
        /* ========================================= */

        if (payable <= 0) {
          continue;
        }

        console.log({
          video: sub.videoId,
          previousViews,
          currentViews: views,
          growth,
          payable
        });

        /* ========================================= */
        /* SAFE TRANSACTION */
        /* ========================================= */

        await prisma.$transaction(
          async (tx) => {

            /* ========================================= */
            /* GET LATEST CAMPAIGN */
            /* ========================================= */

            const latestCampaign =
              await tx.campaign.findUnique({
                where: {
                  id: sub.campaignId
                }
              });

            if (!latestCampaign) {
              throw new Error(
                "Campaign not found"
              );
            }

            /* ========================================= */
            /* PREVENT NEGATIVE BUDGET */
            /* ========================================= */

            if (
              latestCampaign.remainingBudget <
              payable
            ) {
              console.log(
                "⚠️ Not enough budget"
              );

              return;
            }

            /* ========================================= */
            /* UPDATE SUBMISSION */
            /* ========================================= */

            await tx.submission.update({
              where: {
                id: sub.id
              },

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
            });

            /* ========================================= */
            /* UPDATE USER BALANCE */
            /* ========================================= */

            await tx.user.update({
              where: {
                id: sub.userId
              },

              data: {
                balance: {
                  increment: payable
                }
              }
            });

            /* ========================================= */
            /* UPDATE CAMPAIGN BUDGET */
            /* ========================================= */

            await tx.campaign.update({
              where: {
                id: sub.campaignId
              },

              data: {
                remainingBudget: {
                  decrement: payable
                }
              }
            });

          }
        );

        /* ========================================= */
        /* CLOSE CAMPAIGN IF FINISHED */
        /* ========================================= */

        const updatedCampaign =
          await prisma.campaign.findUnique({
            where: {
              id: sub.campaignId
            }
          });

        if (
          updatedCampaign &&
          updatedCampaign.remainingBudget <= 0
        ) {

          await prisma.campaign.update({
            where: {
              id: sub.campaignId
            },

            data: {
              status: "COMPLETED"
            }
          });
        }

      } catch (err) {

        console.error(
          `❌ Error processing submission ${sub.id}:`,
          err.message
        );

        continue;
      }
    }

    console.log("✅ YouTube Cron Done");

  } catch (err) {

    console.error(
      "❌ CRON ERROR:",
      err.message
    );
  }
});