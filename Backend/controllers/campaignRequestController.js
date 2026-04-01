// controllers/campaignRequestController.js

import prisma from "../prisma/client.js";

export const createCampaignRequest = async (req, res) => {
  try {
    const { name, email, company, details } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const request = await prisma.campaignRequest.create({
      data: {
        name,
        email,
        company,
        details
      }
    });

    res.json({
      message: "Request submitted successfully",
      request
    });

  } catch (err) {
    console.error("REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getCampaignRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;

    /* ============================= */
    /* 1. AUTH VALIDATION */
    /* ============================= */

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: Please login"
      });
    }

    /* ============================= */
    /* 2. ADMIN CHECK */
    /* ============================= */

 

    /* ============================= */
    /* 3. FETCH DATA */
    /* ============================= */

    const requests = await prisma.campaignRequest.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateRequestStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    /* ============================= */
    /* 1. AUTH VALIDATION */
    /* ============================= */

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: Please login"
      });
    }
    /* ============================= */
    /* 3. INPUT VALIDATION */
    /* ============================= */

    if (!id || !status) {
      return res.status(400).json({
        message: "Request ID and status are required"
      });
    }

    const allowedStatus = ["PENDING", "APPROVED", "REJECTED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    /* ============================= */
    /* 4. UPDATE */
    /* ============================= */

    const updated = await prisma.campaignRequest.update({
      where: { id },
      data: { status }
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};