import express from "express";
import {
  deleteMySubmission,
  submitVideo
} from "../controllers/submit.js";

import {verifyAccessToken} from "../middleware/authMiddleware.js";

const router = express.Router();

// 🎥 Delete own submission (only if not verified)
router.post("/submit",verifyAccessToken,submitVideo);
router.delete(
  "/submission/:submissionId",
  verifyAccessToken,
  deleteMySubmission
);
export default router;