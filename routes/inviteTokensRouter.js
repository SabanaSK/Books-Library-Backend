import express from "express";
import inviteTokensControllers from "../controllers/inviteTokensControllers.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.get("/validateInviteToken", inviteTokensControllers.validateInviteToken);
router.delete(
  "/:id",
  verify.verifyAdmin,
  inviteTokensControllers.deleteInviteTokenById
);

export default router;
