import express from "express";
import getAllInviteToken from "../controllers/inviteTokensControllers.js";
import verify from "../middleware/verify.js";

const router = express.Router();

//Added as Admin for now but the endpoint might be deleted
router.get("/", verify.verifyAdmin, getAllInviteToken);

export default router;