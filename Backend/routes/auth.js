import express from "express";
import {
  signup,
  login,
  googleLogin,
  refresh,
  logout,
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { getMyProfile } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyAccessToken, getMyProfile);
export default router;