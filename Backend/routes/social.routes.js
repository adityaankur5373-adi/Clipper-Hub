import express from "express"
import {
  addSocialAccount,
  verifySocialAccount,
  getMyAccounts,
  deleteSocial
} from "../controllers/social.controller.js"

import { verifyAccessToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/add",verifyAccessToken , addSocialAccount)
router.post("/verify", verifyAccessToken, verifySocialAccount)
router.get("/me", verifyAccessToken, getMyAccounts)
router.delete("/:accountId", verifyAccessToken, deleteSocial)

export default router