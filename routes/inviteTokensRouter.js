import express from "express";
import inviteTokensControllers from "../controllers/inviteTokensControllers.js";
import verify from "../middleware/verify.js";

const router = express.Router();

//Added as Admin for now but the endpoint might be deleted
router.get("/", verify.verifyAdmin, inviteTokensControllers.getAllInviteToken);
router.get(
  "/validateInviteToken",
  verify.verifyAdmin,
  inviteTokensControllers.validateInviteToken
);
router.delete(
  "/:id",
  verify.verifyAdmin,
  inviteTokensControllers.deleteInviteTokenById
);

export default router;
