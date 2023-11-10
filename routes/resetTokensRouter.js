import express from "express";
import verify from "../middleware/verify.js";
import ResetPasswordToken from "../models/ResetPasswordToken.js";

const router = express.Router();

// Added as Admin for now but the endpoint might be deleted
router.get("/", verify.verifyAdmin, async (req, res, next) => {
  try {
    const tokens = await ResetPasswordToken.findAll();
    res.status(200).json(tokens);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
});

router.get("/validateResetToken", async (req, res) => {
  const resetToken = req.query.token;
  try {
    const storedToken = await ResetPasswordToken.findByToken(resetToken);
    if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invite token." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }

  return res
    .status(200)
    .json({ message: "Successfully InviteToken validation." });
});

export default router;
