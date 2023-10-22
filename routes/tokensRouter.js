import express from "express";
import tokensControllers from "../controllers/tokensControllers.js";

const router = express.Router();

//Will be delete, having it here just for check
router.get("/", tokensControllers.getAllRefreshToken);

router.delete("/logout", tokensControllers.logout);
router.delete("/logoutAllPlace/:id", tokensControllers.logoutAllPlace);

export default router;
