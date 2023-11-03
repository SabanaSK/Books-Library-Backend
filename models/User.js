import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class User {
  constructor(
    id,
    username,
    email,
    password,
    createdAt,
    updatedBy,
    updatedAt,
    status,
    role
  ) {
    this.id = id || uuidv4();
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
    this.status = status;
    this.role = role;
    this.ensureTablesExist();
  }

  async ensureTablesExist() {
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,  
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedBy VARCHAR(36) NULL,
        updatedAt TIMESTAMP NULL DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'active',
        role VARCHAR(50) DEFAULT 'user' 
      );
    `;
    await db.execute(createUsersTableSQL);
  }

  async CreateTable() {
    const sql = `
      INSERT INTO users(
        id, username, email, password, createdAt, updatedBy, updatedAt, status, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      this.id,
      this.username,
      this.email,
      this.password,
      this.createdAt,
      this.updatedBy,
      this.updatedAt,
      this.status,
      this.role,
    ]);
    return this;
  }

  async save() {
    const sql = `
      INSERT INTO users(
        id, username, email, password, status, role
      ) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      this.id,
      this.username,
      this.email,
      this.password,
      this.status,
      this.role,
    ]);
    return this;
  }

  static async findAll() {
    const sql = `SELECT * FROM users`;
    const [allUsers] = await db.execute(sql);
    return allUsers;
  }

  static async findByUsername(username) {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [users] = await db.execute(sql, [username]);

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
  
  static async updatePassword(userId, hashedPassword, updatedBy) {
    const updatedAt = new Date();
    const sql = `
      UPDATE users 
      SET password = ?, updatedBy = ?, updatedAt = ?
      WHERE id = ?`;

    await db.execute(sql, [hashedPassword, updatedBy, updatedAt, userId]);
  }

  static async updateRoleById(role, id, adminId) {
    const sql =
      "UPDATE users SET role = ?, updatedBy = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?";
    await db.execute(sql, [role, adminId, id]);
  }
}

export default User;
