import Token from "../models/Token.js";
import { verifyRefreshToken } from "../middleware/jwt.js";

const getAllRefreshToken = async (req, res, next) => {
  try {
    const token = await Token.findAll();
    res.status(200).json(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }
  try {
    const decodedToken = verifyRefreshToken(refreshToken);
    const userId = decodedToken.user.id;
    const tokenId = await Token.findIdByToken(refreshToken);
    const tokenInDb = await Token.findRefreshTokenForUser(userId, refreshToken);
    if (!tokenInDb) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    await Token.deleteById(tokenId);
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const logoutAllPlace = async (req, res, next) => {
  try {
    const userId = req.params.id;

    await Token.deleteByUserId(userId);
    res.clearCookie("refreshToken");
    res
      .status(200)
      .json({
        message:
          "All tokens are deleted successfully and current device cookie cleared.",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

export default { getAllRefreshToken, logout, logoutAllPlace };
