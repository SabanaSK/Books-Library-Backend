import jwt from "jsonwebtoken";
import Token from "../models/Token.js";

const generateAccessToken = (user) => {
  const payload = {
    user: {
      id: user.id,
    },
  };
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1h" });
};

const generateRefreshToken = (user) => {
  const payload = {
    user: {
      id: user.id,
    },
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
};

const generateAndStoreTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Token.storeRefreshTokenForUser(user.id, refreshToken);

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_KEY);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_KEY);
};
export {
  generateAccessToken,
  generateRefreshToken,
  generateAndStoreTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
