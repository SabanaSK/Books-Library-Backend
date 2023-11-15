import express from "express";
import ResetPasswordToken from "../models/ResetPasswordToken.js";

const router = express.Router();

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
