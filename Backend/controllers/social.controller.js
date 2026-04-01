import prisma from "../prisma/client.js"
import axios from "axios"

// 🔑 Generate Code



/* ============================= */
/* 🔐 GENERATE CODE */
/* ============================= */
function generateCode() {
  return "CLIPSTER-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ============================= */
/* 🔧 EXTRACT USERNAME */
/* ============================= */
function extractUsername(url) {
  return url.replace(/\/$/, "").split("/").pop();
}

/* ============================= */
/* ➕ ADD SOCIAL ACCOUNT */
/* ============================= */
export const addSocialAccount = async (req, res) => {
  try {
    let { profileUrl, platform } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!profileUrl || !platform) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // normalize
    platform = platform.toUpperCase();

    /* ============================= */
    /* 🔍 VALIDATE URL */
    /* ============================= */
    const isValidInstagram = (url) =>
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+(\/.*)?$/.test(url);

    const isValidYouTube = (url) =>
      /^https?:\/\/(www\.)?(youtube\.com\/(channel\/|c\/|user\/|@)[a-zA-Z0-9._-]+(\/.*)?|youtu\.be\/.+)/.test(url);

    let isValid = false;
   

    if (platform === "INSTAGRAM") {
      isValid = isValidInstagram(profileUrl);
    } else if (platform === "YOUTUBE") {
      isValid = isValidYouTube(profileUrl);
    } else {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    if (!isValid) {
      return res.status(400).json({
        error: `Invalid ${platform} profile URL`,
      });
    }

    /* ============================= */
    /* 🔧 GENERATE platformUserId */
    /* ============================= */
    const username = extractUsername(profileUrl);
    /* ============================= */
/* 📡 GET YOUTUBE CHANNEL ID */
/* ============================= */

let channelId = null;

if (platform === "YOUTUBE") {
  try {
    const ytRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: username,
          type: "channel",
          maxResults: 1,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    if (ytRes.data.items.length > 0) {
      channelId = ytRes.data.items[0].snippet.channelId;
    }
  } catch (err) {
    console.error("YOUTUBE CHANNEL FETCH ERROR:", err.message);
  }
}
    const platformUserId = `${platform}_${username}`;

    /* ============================= */
    /* 🚫 PREVENT DUPLICATE */
    /* ============================= */
    const exists = await prisma.socialAccount.findFirst({
      where: {
        platform,
        platformUserId,
      },
    });

    if (exists) {
      return res.status(400).json({
        error: "This social account is already added",
      });
    }

    /* ============================= */
    /* 🔐 GENERATE CODE */
    /* ============================= */
    const code = generateCode();

    /* ============================= */
    /* 💾 SAVE */
    /* ============================= */
    const account = await prisma.socialAccount.create({
      data: {
        userId,
        platform,
        profileUrl,
        platformUserId,
        channelId,
        verificationCode: code,
      },
    });

    return res.json({
      message: "Paste this code in your bio/about section",
      code,
      accountId: account.id,
    });
  } catch (err) {
    console.error("ADD ACCOUNT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ============================= */
/* 🔍 VERIFY ACCOUNT */
/* ============================= */
export const verifySocialAccount = async (req, res) => {
  try {
    const { accountId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const account = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const cleanUrl = account.profileUrl.replace(/\/$/, "");

    const urlsToCheck = [cleanUrl];

    if (account.platform === "YOUTUBE") {
      urlsToCheck.push(cleanUrl + "/about");
    }

    let verified = false;

    for (let url of urlsToCheck) {
      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          },
          timeout: 10000,
        });

        const html = response.data;

        if (html.includes(account.verificationCode)) {
          verified = true;
          break;
        }
      } catch (err) {
        console.log("Error checking URL:", url);
      }
    }

    if (verified) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          verified: true,
          status: "verified",
          verifiedAt: new Date(),
        },
      });

      return res.json({
        verified: true,
        status: "verified",
      });
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        status: "pending",
      },
    });

    return res.json({
      verified: false,
      status: "pending",
      message: "Code not detected automatically. Sent for manual review.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Verification failed" });
  }
};
/* ============================= */
/* 📄 GET USER ACCOUNTS */
/* ============================= */
export const getMyAccounts = async (req, res) => {
  try {
    const userId = req.user.userId
    if (!userId) {
  return res.status(401).json({
    message: "Unauthorized: user not authenticated"
  });
}
    const accounts = await prisma.socialAccount.findMany({
      where: { userId }
    })

    return res.json(accounts)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/* ============================= */
/* ❌ DELETE ACCOUNT */
/* ============================= */
export const deleteSocial = async (req, res) => {
  try {
    const { accountId } = req.params;

    // ✅ 1. Validate ID
    if (!accountId) {
      return res.status(400).json({
        message: "Account ID is required",
      });
    }

    // ✅ 2. Check if account exists
    const existing = await prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // ✅ 3. (Optional but recommended) Ownership check
    // Prevent user from deleting someone else's account
    if (existing.userId !== req.user.userId) {
      return res.status(403).json({
        message: "Unauthorized to delete this account",
      });
    }

    // ✅ 4. Check if submissions exist
    const submissionCount = await prisma.submission.count({
      where: { socialAccountId: accountId },
    });

    if (submissionCount > 0) {
      return res.status(400).json({
        message: "Cannot delete account with submissions 🚫",
      });
    }

    // ✅ 5. Delete account
    await prisma.socialAccount.delete({
      where: { id: accountId },
    });

    // ✅ 6. Success response
    return res.status(200).json({
      message: "Account deleted successfully ✅",
    });

  } catch (err) {
    console.error("Delete error:", err);

    return res.status(500).json({
      message: "Server error while deleting account",
    });
  }
};
export const getAllAccountsAdmin = async (req, res) => {
  try {
    const adminId = req.user.userId;

    // 🔐 safety check
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accounts = await prisma.socialAccount.findMany({
      select: {
        id: true,
        platform: true,
        profileUrl: true,
        status: true,
        verified: true,
        verificationCode: true,
        createdAt: true,
        verifiedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      adminId, // 👈 useful for debugging / tracking
      accounts,
    });

  } catch (err) {
    console.error("GET ADMIN ACCOUNTS ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch accounts" });
  }
};
export const updateAccountStatusAdmin = async (req, res) => {
  try {
     
    const { accountId } = req.params;
    const { status } = req.body;
    
    // ✅ validate status
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // ✅ check account exists
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const updated = await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        status,
        verified: status === "verified",
        verifiedAt: status === "verified" ? new Date() : null,

        // 🔥 OPTIONAL (if you later add field)
        // approvedBy: adminId
      },
    });

    return res.json({
      message: "Status updated",
      account: updated,
    });

  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err);
    return res.status(500).json({ error: "Update failed" });
  }
};