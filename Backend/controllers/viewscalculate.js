import prisma from "../prisma/client.js";

export const updateInstagramStats = async (req, res) => {

  try {

    const { submissionId } = req.params;

    const {
      views,
      likes,
      comments,
      shares
    } = req.body;

    /* ========================================= */
    /* VIEWS REQUIRED */
    /* ========================================= */

    if (views === undefined) {
      return res.status(400).json({
        message: "Views are required"
      });
    }

    /* ========================================= */
    /* FETCH SUBMISSION */
    /* ========================================= */

    const sub = await prisma.submission.findUnique({
      where: {
        id: submissionId
      },

      include: {
        campaign: true,
        socialAccount: true
      }
    });

    /* ========================================= */
    /* SUBMISSION NOT FOUND */
    /* ========================================= */

    if (!sub) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    /* ========================================= */
    /* PLATFORM CHECK */
    /* ========================================= */

    if (
      sub.socialAccount.platform !== "INSTAGRAM"
    ) {

      return res.status(400).json({
        message: "Not an Instagram submission"
      });
    }

    /* ========================================= */
    /* ELIGIBILITY CHECK */
    /* ========================================= */

    if (
      sub.status !== "APPROVED" ||
      !sub.isVerified ||
      !sub.isEligible
    ) {

      return res.status(400).json({
        message:
          "Submission not eligible for earnings"
      });
    }

    /* ========================================= */
    /* OLD VIEWS */
    /* ========================================= */

    const previousViews = sub.views || 0;

    /* ========================================= */
    /* PREVENT VIEW DECREASE */
    /* ========================================= */

    if (views < previousViews) {

      return res.status(400).json({
        message: "Views cannot decrease"
      });
    }

    /* ========================================= */
    /* NO NEW VIEWS */
    /* ========================================= */

    if (views === previousViews) {

      return res.json({
        message: "No new views update"
      });
    }

    /* ========================================= */
    /* SAFE VALUES */
    /* ========================================= */

    const v = Number(views) || 0;
    const l = Number(likes) || 0;
    const c = Number(comments) || 0;
    const s = Number(shares) || 0;

    /* ========================================= */
    /* ENGAGEMENT RATE */
    /* ========================================= */

    const engagementRate =
      v > 0
        ? ((l + c + s) / v) * 100
        : 0;

    /* ========================================= */
    /* ANTI BOT CHECK */
    /* ========================================= */

    if (engagementRate < 0.5) {

      await prisma.submission.update({
        where: {
          id: sub.id
        },

        data: {
          isEligible: false
        }
      });

      return res.status(400).json({
        message:
          "Low engagement detected → marked ineligible"
      });
    }

    /* ========================================= */
    /* GROWTH */
    /* ========================================= */

    const growth = v - previousViews;

    /* ========================================= */
    /* SPIKE DETECTION */
    /* ========================================= */

    if (growth > 100000) {

      return res.status(400).json({
        message: "Suspicious spike detected"
      });
    }

    /* ========================================= */
    /* NEW EARNING */
    /* ========================================= */

    let newEarning =
      (growth / 1_000_000) *
      sub.campaign.ratePerMillion;

    newEarning = Number(
      newEarning.toFixed(2)
    );

    /* ========================================= */
    /* INVALID NUMBER CHECK */
    /* ========================================= */

    if (isNaN(newEarning)) {

      return res.status(400).json({
        message: "Invalid earning value"
      });
    }

    /* ========================================= */
    /* OLD EARNINGS */
    /* ========================================= */

    const oldEarnings =
      sub.earnings || 0;

    /* ========================================= */
    /* TOTAL EARNINGS */
    /* ========================================= */

    let totalEarnings =
      oldEarnings + newEarning;

    /* ========================================= */
    /* MAX EARNING PER POST */
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
    /* FINAL PAYABLE */
    /* ========================================= */

    let finalPayable = Number(
      (
        totalEarnings - oldEarnings
      ).toFixed(2)
    );

    /* ========================================= */
    /* NO NEW EARNINGS */
    /* ========================================= */

    if (finalPayable <= 0) {

      return res.json({
        message: "No new earnings"
      });
    }

    /* ========================================= */
    /* USER TOTAL */
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

        return res.status(400).json({
          message:
            "User reached max earnings limit"
        });
      }

      finalPayable = Math.min(
        finalPayable,
        remainingUserLimit
      );
    }

    /* ========================================= */
    /* FINAL SAFETY */
    /* ========================================= */

    if (finalPayable <= 0) {

      return res.status(400).json({
        message: "No payable amount"
      });
    }

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
          finalPayable
        ) {

          throw new Error(
            "Campaign budget exhausted"
          );
        }

        /* ========================================= */
        /* UPDATE SUBMISSION */
        /* ========================================= */

        await tx.submission.update({
          where: {
            id: sub.id
          },

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
        });

        /* ========================================= */
        /* UPDATE USER */
        /* ========================================= */

        await tx.user.update({
          where: {
            id: sub.userId
          },

          data: {
            balance: {
              increment: finalPayable
            }
          }
        });

        /* ========================================= */
        /* UPDATE CAMPAIGN */
        /* ========================================= */

        await tx.campaign.update({
          where: {
            id: sub.campaignId
          },

          data: {
            remainingBudget: {
              decrement: finalPayable
            }
          }
        });

      }
    );

    /* ========================================= */
    /* CLOSE CAMPAIGN */
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

    /* ========================================= */
    /* SUCCESS */
    /* ========================================= */

    return res.json({
      message: "Instagram stats updated",
      earned: finalPayable,
      engagementRate
    });

  } catch (err) {

    console.error(
      "INSTAGRAM UPDATE ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message || "Server error"
    });
  }
};