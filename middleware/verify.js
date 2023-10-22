import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyAdmin = async (req, res, next) => {
  try { 
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Permission denied" });
    }
    req.user = user;
    next(); 
  } catch (err) {
    console.error("Error in verifyAdmin middleware:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const verifyAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("Error in verifyAuth middleware:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};



export default {verifyAdmin, verifyAuth};
