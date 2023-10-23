import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import InviteToken from "../models/InviteToken.js";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../middleware/sendEmail.js";
import * as dotenv from "dotenv";

import {
  generateAccessToken,
  generateAndStoreTokens,
  verifyRefreshToken,
} from "../middleware/jwt.js";

dotenv.config();

const inviteUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    const inviteToken = new InviteToken(
      null,
      req.user.id,
      uuidv4(),
      email,
      "active",
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    );

    await inviteToken.save();
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

const registerWithInvite = async (req, res, next) => {
  const { username, email, password, inviteToken } = req.body;

  try {
    const storedToken = await InviteToken.findByToken(inviteToken);
    if (!storedToken || storedToken.email !== email) {
      return res.status(400).json({ message: "Invalid invite token." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User(
      null,
      username,
      email,
      hashedPassword,
      null,
      null,
      null,
      "active",
      "user" //Change later so Admin can give role
    );
    await user.save();

    await InviteToken.deactivate(inviteToken);

    res.status(200).json({ message: "Registration successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

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
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).json({ accessToken, user });
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

    const accessToken = generateAccessToken(user);
    res.json({ accessToken, user });
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
  getAllUsers,
  deleteById,
};
