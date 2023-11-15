import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class InviteToken {
  constructor(inviterId, inviteToken, email, status, issuedAt, expiresAt) {
    this.id = uuidv4();
    this.inviterId = inviterId;
    this.inviteToken = inviteToken;
    this.email = email;
    this.status = status;
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
    this.ensureInviteTokenTableExist();
  }

  async ensureInviteTokenTableExist() {
    const inviteTokensTableSQL = `
      CREATE TABLE IF NOT EXISTS inviteTokens (
        Id VARCHAR(36) PRIMARY KEY,
        inviterId VARCHAR(36) NOT NULL,
        inviteToken VARCHAR(512) UNIQUE NOT NULL,  
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expiresAt TIMESTAMP NOT NULL,      
        FOREIGN KEY (inviterId) REFERENCES users(id)

      );
    `;
    await db.execute(inviteTokensTableSQL);
  }

  async save() {
    const sql =
      "INSERT INTO inviteTokens(Id, inviterId, inviteToken, email, expiresAt) VALUES(?, ?, ?, ?, ?)";
    const [newToken] = await db.execute(sql, [
      this.id,
      this.inviterId,
      this.inviteToken,
      this.email,
      this.expiresAt,
    ]);
    return newToken;
  }

  static async findByToken(inviteToken) {
    const sql = "SELECT * FROM inviteTokens WHERE inviteToken = ?";
    const [tokens] = await db.execute(sql, [inviteToken]);
    if (tokens.length === 0) {
      return null;
    }
    return tokens[0];
  }

  static async deleteToken(token) {
    const sql = `DELETE FROM inviteTokens WHERE inviteToken = ?`;
    await db.execute(sql, [token]);
  }
}

export default InviteToken;
