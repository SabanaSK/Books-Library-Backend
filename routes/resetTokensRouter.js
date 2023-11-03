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

export default router;
