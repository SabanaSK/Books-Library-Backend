import db from "../config/db.js";

class InviteToken {
  constructor(id, inviterId, inviteToken, email, status, issuedAt, expiresAt) {
    this.id = id;
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
        id INT AUTO_INCREMENT PRIMARY KEY,
        inviterId INT NOT NULL,
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
      "INSERT INTO inviteTokens(inviterId, inviteToken, email, expiresAt) VALUES(?, ?, ?, ?)";
    const [newToken] = await db.execute(sql, [
      this.inviterId,
      this.inviteToken,
      this.email,
      this.expiresAt,
    ]);
    this.id = newToken.insertId;
    return this;
  }

  static async findAll() {
    const sql = `SELECT * FROM tokens`;
    const [allTokens] = await db.execute(sql);
    return allTokens;
  }
}

export default InviteToken;
