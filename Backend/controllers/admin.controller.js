import prisma from "../prisma/client.js";

// ✅ Approve / Reject withdrawal
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED / REJECTED

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: id },
    });

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({
        message: "Already processed",
      });
    }

    // 🔥 If approved → deduct balance
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            decrement: withdrawal.amount,
          },
        },
      });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: id },
      data: { status },
    });

    res.json({
      message: `Withdrawal ${status}`,
      updated,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating withdrawal" });
  }
};
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        campaign: {
          select: { id: true, name: true,allowedPlatforms:true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(submissions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};


export const getClosedCampaignsWithEarnings = async (req, res) => {
  try {
    // 🔥 Get all CLOSED campaigns with submissions
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "CLOSED",
      },
      include: {
        submissions: {
          where: {
            isEligible: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 🔥 Format response
    const result = campaigns.map((campaign) => ({
      campaignId: campaign.id,
      campaignName: campaign.name,
      totalBudget: campaign.totalBudget,
      remainingBudget: campaign.remainingBudget,

      users: campaign.submissions.map((sub) => ({
        userId: sub.user.id,
        name: sub.user.name,
        email: sub.user.email,
        views: sub.views || 0,
        earned: sub.earnedAmount || 0,
      })),
    }));

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch campaigns with earnings",
    });
  }
};


export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Optional: format response (very useful for admin UI)
    const formatted = withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      status: w.status,
      upiId: w.upiId, // ✅ from Withdrawal model
      createdAt: w.createdAt,

      user: {
        id: w.user.id,
        name: w.user.name,
        email: w.user.email,
        provider: w.user.provider,
      },
    }));

    res.json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch withdrawals",
    });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const { campaignId, submissionId } = req.params;
    const { status, isVerified, isEligible } = req.body;

    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        campaignId,
      },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const updateData = {};

    /* ============================= */
    /* STATUS */
    /* ============================= */
    if (status !== undefined) {
      updateData.status = status;
    }

    /* ============================= */
    /* 💥 FORCE RESET ON REJECT */
    /* ============================= */
    if (status === "REJECTED") {
      updateData.isVerified = false;
      updateData.isEligible = false;
    } else {
      /* ============================= */
      /* VERIFIED */
      /* ============================= */
      if (isVerified !== undefined) {
        if (submission.isVerified) {
          return res.status(400).json({
            message: "Already verified",
          });
        }
        updateData.isVerified = isVerified;
      }

      /* ============================= */
      /* ELIGIBLE */
      /* ============================= */
      if (isEligible !== undefined) {
        updateData.isEligible = isEligible;
      }
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
    });

    res.json({
      message: "Submission updated",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating submission",
    });
  }
};
