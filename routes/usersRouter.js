import express from "express";
import usersControllers from "../controllers/usersControllers.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.post("/login", usersControllers.login);

//The autoLogin function is called when the Access Token expires only and validate Refresh token
router.post("/autoLogin", usersControllers.autoLogin);

//These two might be delete or edit
router.get("/", verify.verifyAdmin, usersControllers.getAllUsers);
router.delete("/:id", verify.verifyAdmin, usersControllers.deleteById);

export default router;
