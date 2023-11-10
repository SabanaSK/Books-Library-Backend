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

const validateInviteToken = async (req, res) => {
  const inviteToken = req.query.token;
  try {
    const storedToken = await InviteToken.findByToken(inviteToken);
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
}

const deleteInviteTokenById = async (req, res, next) => {
  try {
    const id = req.params.id;
    await InviteToken.deleteById(id);
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

export default { getAllInviteToken, validateInviteToken, deleteInviteTokenById };
