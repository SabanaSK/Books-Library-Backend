import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import InviteToken from "../models/InviteToken.js";
import ResetPasswordToken from "../models/ResetPasswordToken.js";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../middleware/sendEmail.js";
import * as dotenv from "dotenv";
import Validator from "../utils/validator.js";
import { commonPasswords } from "../data/commonPassword.js";
import {
  generateAccessToken,
  generateAndStoreTokens,
  verifyRefreshToken,
} from "../middleware/jwt.js";

dotenv.config();

const inviteUser = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!Validator.isVAlidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existingUserWithUsername = await User.findByUsername(username);
    if (existingUserWithUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const inviteToken = new InviteToken(
      req.user.id,
      uuidv4(),
      email,
      "active",
      new Date(),
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    );

    await inviteToken.save();
    const user = new User(
      null,
      username,
      email,
      null,
      null,
      null,
      null,
      "invited",
      "user"
    );

    await user.save();
    const inviteURL = `http://localhost:${process.env.PORT}/register?token=${inviteToken.inviteToken}`;

    req.emailDetails = {
      to: email,
      subject: "You are invited to our platform!",
      body: `Click on the link to register: ${inviteURL}, Here is your ${inviteToken} `,
    };

    sendEmail(req, res, next);

    res.status(200).json({ message: "Invitation sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const registerWithInvite = async (req, res) => {
  const { inviteToken, password } = req.body;
  try {
    const storedToken = await InviteToken.findByToken(inviteToken);

    if (!Validator.isValidatePassword(password)) {
      return res.status(400).json({ message: "Invalid password format." });
    }
    if (commonPasswords.includes(password)) {
      return res.status(400).json({
        message:
          "Please choose a stronger password. The one provided is too common.",
      });
    }

    if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invite token." });
    }
    const existingUser = await User.findByEmail(storedToken.email);
    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await User.update(existingUser);
      await InviteToken.deactivate(inviteToken);
      return res
        .status(200)
        .json({ message: "Registration completed successfully." });
    } else {
      return res.status(400).json({ message: "Invalid invite token." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!Validator.isVAlidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    const responseUser = {
      id: user.id,
      username: user.username,
      status: user.status,
      role: user.role,
    };

    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).json({ accessToken, user: responseUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const autoLogin = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const decodedToken = verifyRefreshToken(refreshToken);
    const userId = decodedToken.user.id;

    const tokenInDb = await Token.findRefreshTokenForUser(userId, refreshToken);
    if (!tokenInDb) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const responseUser = {
      id: user.id,
      username: user.username,
      status: user.status,
      role: user.role,
    };
    const accessToken = generateAccessToken(user);
    res.json({ accessToken, user: responseUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!Validator.isVAlidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const resetToken = uuidv4();
    const token = new ResetPasswordToken(
      null,
      user.id,
      resetToken,
      "active",
      new Date(),
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    );

    await token.save();

    const resetURL = `http://localhost:${process.env.PORT}/reset-password?token=${resetToken}`;
    req.emailDetails = {
      to: user.email,
      subject: "Reset Password Request",
      body: `Click on the link to reset your password: ${resetURL}`,
    };
    sendEmail(req, res, next);

    res
      .status(200)
      .json({ message: "Reset password email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (!Validator.isValidatePassword(password)) {
      return res.status(400).json({ message: "Invalid password format." });
    }
    if (commonPasswords.includes(password)) {
      return res.status(400).json({
        message:
          "Please choose a stronger password. The one provided is too common.",
      });
    }

    const storedToken = await ResetPasswordToken.findByToken(resetToken);

    if (
      !storedToken ||
      new Date(storedToken.expiresAt) < new Date() ||
      storedToken.status !== "active"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    const user = await User.findById(storedToken.requestUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await User.update(user);

    await ResetPasswordToken.deactivate(resetToken);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const posts = await User.findAll();
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const deleteById = async (req, res, next) => {
  try {
    const id = req.params.id;
    await User.deleteById(id);
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

export default {
  inviteUser,
  registerWithInvite,
  login,
  autoLogin,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  deleteById,
};
