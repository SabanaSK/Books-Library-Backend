import express from "express";
import tokensControllers from "../controllers/tokensControllers.js";
import verify from "../middleware/verify.js";

const router = express.Router();

//Added as Admin for now but the endpoint might be deleted
router.get("/", verify.verifyAdmin, tokensControllers.getAllRefreshToken);

router.delete("/logout", tokensControllers.logout);
router.delete("/logoutAllPlace/:id", tokensControllers.logoutAllPlace);

export default router;
