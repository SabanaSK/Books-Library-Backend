import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import {
  generateAccessToken,
  generateAndStoreTokens,
  verifyRefreshToken,
} from "../middleware/jwt.js";

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
  login,
  autoLogin,
  getAllUsers,
  deleteById
};
