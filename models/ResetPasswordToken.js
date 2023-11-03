import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class ResetPasswordToken {
  constructor(requestUserId, resetToken, status, issuedAt, expiresAt) {
    this.id = uuidv4();
    this.requestUserId = requestUserId;
    this.resetToken = resetToken;
    this.status = status || "active";
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
    this.ensureResetTokenTableExist();
  }

  async ensureResetTokenTableExist() {
    const resetTokensTableSQL = `
      CREATE TABLE IF NOT EXISTS resetTokens (
        Id VARCHAR(36) PRIMARY KEY,
        requestUserId VARCHAR(36) NOT NULL,
        resetToken VARCHAR(512) UNIQUE NOT NULL,  
        status VARCHAR(50) DEFAULT 'active',
        issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expiresAt TIMESTAMP NOT NULL
      );
    `;
    await db.execute(resetTokensTableSQL);
  }

  async save() {
    const sql =
      "INSERT INTO resetTokens(Id, requestUserId, resetToken,  expiresAt) VALUES(?, ?, ?, ?)";
    const [newToken] = await db.execute(sql, [
      this.id,
      this.requestUserId,
      this.resetToken,
      this.expiresAt,
    ]);
    return newToken;
  }

  static async findAll() {
    const sql = `SELECT * FROM resetTokens`;
    const [allTokens] = await db.execute(sql);
    return allTokens;
  }

  static async findByToken(token) {
    const sql = "SELECT * FROM resetTokens WHERE resetToken = ?";
    const [tokens] = await db.execute(sql, [token]);
    if (tokens.length === 0) {
      return null;
    }
   
    return new ResetPasswordToken(
      tokens[0].requestUserId, 
      tokens[0].resetToken, 
      tokens[0].status, 
      tokens[0].issuedAt,
      tokens[0].expiresAt 
    );
  }

  static async isValidToken(token) {
    const resetToken = await this.findByToken(token);
    if (!resetToken) return false;
    if (resetToken.status !== "active") return false;
    if (new Date(resetToken.expiresAt) <= new Date()) return false;
    return true;
  }

  async invalidate() {
    const sql = "UPDATE resetTokens SET status = 'invalidated' WHERE id = ?";
    await db.execute(sql, [this.id]);
    this.status = "invalidated";
  }
  static async deactivate(token) {
    const sql = `
      UPDATE resetTokens 
      SET status = 'inactive'
      WHERE resetToken = ?`;

    await db.execute(sql, [token]);
  }
}

export default ResetPasswordToken;
