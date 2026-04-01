import express from "express";
import {
  getAllAccountsAdmin,
  updateAccountStatusAdmin,
} from "../controllers/social.controller.js";
import {
  updateWithdrawalStatus,
  getAllSubmissions,
  getClosedCampaignsWithEarnings,
   getAllWithdrawals,
   updateSubmissionStatus
} from "../controllers/admin.controller.js";
import { updateInstagramStats } from "../controllers/viewscalculate.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Admin only routes

// 📹 Submissions
router.get(
  "/submissions",
  verifyAccessToken,
  isAdmin,
  getAllSubmissions
);

router.get("/accounts", verifyAccessToken, isAdmin, getAllAccountsAdmin);
router.get(
  "/campaigns/closed/earnings",
  verifyAccessToken,
  isAdmin,
  getClosedCampaignsWithEarnings
);
router.get(
  "/withdrawals",
  verifyAccessToken,
  isAdmin,
  getAllWithdrawals
);
router.put("/accounts/:accountId", verifyAccessToken, isAdmin, updateAccountStatusAdmin);
router.patch(
  "/withdrawal/:id",
  verifyAccessToken,
  isAdmin,
  updateWithdrawalStatus
);
router.patch(
  "/campaign/:campaignId/submission/:submissionId",
  verifyAccessToken,
  isAdmin,
  updateSubmissionStatus
);
router.patch(
  "/instagram/:submissionId",
  verifyAccessToken,
  isAdmin,
  updateInstagramStats
);
export default router;