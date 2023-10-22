import db from "../config/db.js";

class User {
  constructor(
    id,
    username,
    email,
    password,
    createdAt,
    updatedAt,
    deletedAt,
    status,
    role
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.status = status;
    this.role = role;
    this.ensureTablesExist();
  }

  async ensureTablesExist() {
    const createUsersTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NULL DEFAULT NULL,
    deletedAt TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    role VARCHAR(50) DEFAULT 'user' 
  );
`;
    await db.execute(createUsersTableSQL);
  }

  async save() {
    const sql = `
      INSERT INTO users(username, email, password, status, role) 
      VALUES(?, ?, ?, 'active', ?)`;
    const [newUser] = await db.execute(sql, [
      this.username,
      this.email,
      this.password,
      this.role,
    ]);
    this.id = newUser.insertId;
    return this;
  }

  static async findAll() {
    const sql = `SELECT * FROM users`;
    const [allUsers] = await db.execute(sql);
    return allUsers;
  }

  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [users] = await db.execute(sql, [email]);

    if (users.length === 0) {
      return null;
    }
    const user = users[0];
    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
      user.status,
      user.role
    );
  }

  static async findById(id) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const [users] = await db.execute(sql, [id]);

    if (users.length === 0) {
      return null;
    }
    const user = users[0];
    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
      user.status,
      user.role
    );
  }

  static async deleteById(id) {
    const sql = `DELETE FROM users WHERE Id = ?`;
    await db.execute(sql, [id]);
  }
}

export default User;
