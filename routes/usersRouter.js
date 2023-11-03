import express from "express";
import usersControllers from "../controllers/usersControllers.js";
import verify from "../middleware/verify.js";
const router = express.Router();

router.post("/invite", verify.verifyAdmin, usersControllers.inviteUser);
router.post("/register", usersControllers.registerWithInvite);
router.post("/login", usersControllers.login);
router.post("/forgotPassword", usersControllers.requestPasswordReset);
router.post("/resetPassword", usersControllers.resetPassword);
router.post("/autoLogin", usersControllers.autoLogin);
router.patch("/:id", verify.verifyAdmin, usersControllers.updateUser);

//Double check at the end if it needed
router.get("/", verify.verifyAdmin, usersControllers.getAllUsers);
router.delete("/:id", verify.verifyAdmin, usersControllers.deleteById);

export default router;
