import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import InviteToken from "../models/InviteToken.js";
import ResetPasswordToken from "../models/ResetPasswordToken.js";
import Book from "../models/Book.js";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../middleware/sendEmail.js";
import * as dotenv from "dotenv";
import Validator from "../utils/validator.js";
import { commonPasswords } from "../data/commonPassword.js";
import {
  generateAccessToken,
  generateAndStoreTokens,
  verifyAccessToken,
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
      "user",
      req.user.id
    );

    await user.save();
    const inviteURL = `http://localhost:5173/#/register?token=${inviteToken.inviteToken}`;

    req.emailDetails = {
      to: email,
      subject: "You are invited to our platform!",
      body: `Click on the link to register: ${inviteURL}`,
    };

    sendEmail(req, res, next);

    res.status(200).json({ message: "Invitation sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const registerWithInvite = async (req, res) => {
  const inviteToken = req.query.token;
  const { password } = req.body;
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
      await User.updatePassword(
        existingUser.id,
        hashedPassword,
        existingUser.id
      );
      await User.updateStatus(existingUser.id, "active", existingUser.id);
      await InviteToken.deleteToken(inviteToken);
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

const login = async (req, res) => {
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
  }
};

const autoLogin = async (req, res) => {
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
    console.log("Catch error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const decodedToken = verifyAccessToken(token);
    const userId = decodedToken.user.id;
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
    res.status(200).json({ message: "Your current user", user: responseUser });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token." });
    } else {
      res.status(500).json({ message: "Could not verify user." });
    }
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
      user.id,
      resetToken,
      "active",
      new Date(),
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    );

    await token.save();

    const resetURL = `http://localhost:5173/#/reset-password?token=${resetToken}`;
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
  }
};

const resetPassword = async (req, res) => {
  const resetToken = req.query.token;
  const { newPassword, confirmPassword } = req.body;
  try {
    const storedToken = await ResetPasswordToken.findByToken(resetToken);
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (!Validator.isValidatePassword(newPassword)) {
      return res.status(400).json({ message: "Invalid password format." });
    }

    if (commonPasswords.includes(newPassword)) {
      return res.status(400).json({
        message:
          "Please choose a stronger password. The one provided is too common.",
      });
    }
    if (
      !storedToken ||
      new Date(storedToken.expiresAt) < new Date() ||
      storedToken.status !== "active"
    ) {
      return res.status(400).json({ message: "Invalid or expired ." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(
      storedToken.requestUserId,
      hashedPassword,
      storedToken.requestUserId
    );

    await ResetPasswordToken.deactivate(resetToken);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateRoleById(role, id, adminId);

    res
      .status(200)
      .json({ message: "Role updated successfully", updatedRole: role });
  } catch (error) {
    console.error("Error updating user's role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const responseUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedBy: user.updatedBy,
      updatedAt: user.updatedAt,
      status: user.status,
      role: user.role,
    }));
    res.status(200).json(responseUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const id = req.params.id;
    const newUserId = req.user.id;
    await Book.updatePostsOwner(id, newUserId);
    await User.deleteById(id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedBy: user.updatedBy,
      updatedAt: user.updatedAt,
      status: user.status,
      role: user.role,
    };

    res.status(200).json(responseUser);
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
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateUser,
  getAllUsers,
  deleteById,
  getUserById,
};
