import express from "express";
import {
  getBalance,
  requestWithdrawal,
} from "../controllers/wallet.controller.js";
import {verifyAccessToken} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/balance", verifyAccessToken, getBalance);
router.post("/withdraw", verifyAccessToken, requestWithdrawal);
export default router;