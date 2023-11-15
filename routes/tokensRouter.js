import express from "express";
import tokensControllers from "../controllers/tokensControllers.js";

const router = express.Router();

router.delete("/logout", tokensControllers.logout);
router.delete("/logoutAllPlace/:id", tokensControllers.logoutAllPlace);

export default router;
