import express from "express";
import booksControllers from "../controllers/booksControllers.js";
import verify from "../middleware/verify.js";
const router = express.Router();

router.get("/", verify.verifyAuth, booksControllers.getAllPosts);
router.get("/:id", verify.verifyAuth, booksControllers.getPostById);
router.post("/", verify.verifyAdmin, booksControllers.createNewPost);
router.put("/:id", verify.verifyAdmin, booksControllers.updatePostById);
router.delete("/:id", verify.verifyAdmin, booksControllers.deleteById);

export default router;
