import express from "express";
import {
  addUpi,
  updateUpi,
  getMyUpi
} from "../controllers/payment.controller.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upi/add", verifyAccessToken, addUpi);
router.patch("/upi/update", verifyAccessToken, updateUpi);
router.get("/upi", verifyAccessToken, getMyUpi);

export default router;