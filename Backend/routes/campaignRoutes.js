import express from "express";
import { createCampaignRequest,getCampaignRequests ,updateRequestStatus } from "../controllers/campaignRequestController.js";
import { createCampaignFromRequest,getCampaignById,getAllCampaigns,getMyCampaigns} from "../controllers/campaignController.js";

import { verifyAccessToken,isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/campaign/launch", createCampaignRequest);
router.get("/campaign/all",verifyAccessToken, isAdmin,getCampaignRequests );
router.get("/campaigns", getAllCampaigns);
router.get("/mycampaign",verifyAccessToken,getMyCampaigns)
router.patch("/campaign/:id/status", verifyAccessToken, isAdmin,updateRequestStatus);
router.post("/campaign/create/:id",verifyAccessToken, isAdmin, createCampaignFromRequest);
router.get("/campaign/:id",verifyAccessToken,getCampaignById)
export default router;