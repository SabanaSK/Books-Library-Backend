import db from "../config/db.js";

class Book {
  constructor(title, genre, author, createdBy, createdAt, updateBy, updateAt) {
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
        Id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updateBy INT NULL DEFAULT NULL,
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
      INSERT INTO postsbook(title, genre, author, createdBy, createdAt, updateBy, updateAt)
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    const [newPost] = await db.execute(sql, [
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
