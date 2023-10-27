import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class Book {
  constructor(title, genre, author, createdBy, createdAt, updateBy, updateAt) {
    this.id = uuidv4();
    this.title = title;
    this.genre = genre;
    this.author = author;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updateBy = updateBy;
    this.updateAt = updateAt;
    this.ensureTableExists();
  }

  async ensureTableExists() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS postsbook (
        Id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        createdBy VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updateBy VARCHAR(36) NULL DEFAULT NULL,
        updateAt TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(Id),
        FOREIGN KEY (updateBy) REFERENCES users(Id)
      );
    `;
    await db.execute(createTableSQL);
  }

  async save() {
    const currentDate = new Date();
    let sql = `
      INSERT INTO postsbook(Id, title, genre, author, createdBy, createdAt, updateBy, updateAt)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [newPost] = await db.execute(sql, [
      this.id,
      this.title,
      this.genre,
      this.author,
      this.createdBy,
      currentDate,
      null,
      null,
    ]);
    return newPost;
  }

  static async findAll() {
    const sql = `SELECT * FROM postsbook`;
    const [allPosts] = await db.execute(sql);
    return allPosts;
  }

  static async findById(id) {
    const sql = `SELECT * FROM postsbook WHERE Id = ?`;
    const [post] = await db.execute(sql, [id]);

    if (post.length === 0) {
      return null;
    }
    return post[0];
  }

  static async updateById(id, title, genre, author, updateBy) {
    const currentDate = new Date();
    const sql = `
      UPDATE postsbook SET title = ?, genre = ?, author = ?, updateBy = ?, updateAt = ? 
      WHERE Id = ?
    `;
    await db.execute(sql, [title, genre, author, updateBy, currentDate, id]);
  }

  static async deleteById(id) {
    const sql = `DELETE FROM postsbook WHERE Id = ?`;
    await db.execute(sql, [id]);
  }
}

export default Book;
