import InviteToken from "../models/InviteToken.js";

const getAllInviteToken = async (req, res, next) => {
  try {
    const token = await InviteToken.findAll();
    res.status(200).json(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

export default getAllInviteToken;
