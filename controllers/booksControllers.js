import Book from "../models/Book.js";

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Book.findAll();
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Book.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const createNewPost = async (req, res, next) => {
  try {
    const { title, genre, author } = req.body;
    const userId = req.user.id;

    let book = new Book(title, genre, author, userId);
    await book.save(userId);

    res.status(201).json({ message: "Post created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const updatePostById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, image, genre, author } = req.body;

    await Book.updateById(id, title, image, genre, author);

    res.status(200).json({ message: "Post updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

const deleteById = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Book.deleteById(id);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
    next(error);
  }
};

export default {
  createNewPost,
  getAllPosts,
  getPostById,
  deleteById,
  updatePostById,
};
