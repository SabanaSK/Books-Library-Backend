import db from "../config/db.js";

class Token {
  constructor(id, userId, token, issuedAt, expiresAt, revoked) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
    this.revoked = revoked;
    this.ensureTokenTableExist();
  }

  async ensureTokenTableExist() {
    const createTokensTableSQL = `
      CREATE TABLE IF NOT EXISTS tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        token VARCHAR(512) UNIQUE NOT NULL,  
        issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,       
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;
    await db.execute(createTokensTableSQL);
  }

  async save() {
    const sql =
      "INSERT INTO tokens(userId, token, expiresAt, revoked) VALUES(?, ?, ?, ?)";
    const [newToken] = await db.execute(sql, [
      this.userId,
      this.token,
      this.expiresAt,
      this.revoked,
    ]);
    this.id = newToken.insertId;
    return this;
  }
  static async findAll() {
    const sql = `SELECT * FROM tokens`;
    const [allTokens] = await db.execute(sql);
    return allTokens;
  }
  static async findIdByToken(refreshToken) {
    const sql = "SELECT id FROM tokens WHERE token = ?";
    const [tokens] = await db.execute(sql, [refreshToken]);
    if (tokens.length === 0) {
      return null;
    }
    return tokens[0].id;
}

  static async findRefreshTokenForUser(userId, token) {
    const sql = "SELECT token FROM tokens WHERE userId = ? AND token = ?";
    const [tokens] = await db.execute(sql, [userId, token]);

    if (tokens.length === 0) {
      return null;
    }
    return tokens[0].token;
  }

  static async storeRefreshTokenForUser(userId, token) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const sql = "INSERT INTO tokens(userId, token, expiresAt) VALUES(?, ?, ?)";
    await db.execute(sql, [userId, token, expiryDate]);
  }

  static async invalidateRefreshTokenForUser(userId, token) {
    const sql = "DELETE FROM tokens WHERE userId = ? AND token = ?";
    await db.execute(sql, [userId, token]);
  }

  static async deleteById(id) {
    const sql = `DELETE FROM tokens WHERE Id = ?`;
    await db.execute(sql, [id]);
  }

  static async deleteByUserId(userId) {
    const sql = `DELETE FROM tokens WHERE UserId = ?`;
    await db.execute(sql, [userId]);
  }
}

export default Token;
