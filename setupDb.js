import pool from "./config/db.js";
import User from "./models/User.js";
import Book from "./models/Book.js";
import Token from "./models/Token.js";
import InviteToken from "./models/InviteToken.js";
import ResetToken from "./models/ResetPasswordToken.js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const setupDatabase = async () => {
  const user = new User();
  await user.ensureTablesExist();

  const adminUser = await User.findByUsername(process.env.ADMIN_USERNAME);
  if (!adminUser) {
    console.log("Admin user not found, creating one...");
    const newPassword = process.env.ADMIN_PASSWORD;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const newAdmin = new User(
      null,
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_EMAIL,
      hashedPassword,
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      null,
      null,
      "active",
      "admin"
    );

    await newAdmin.CreateTable();
    console.log("Admin user created successfully!");
  }
  const book = new Book();
  await book.ensureTableExists();

  const token = new Token();
  await token.ensureTokenTableExist();

  const inviteToken = new InviteToken();
  await inviteToken.ensureInviteTokenTableExist();

  const resetToken = new ResetToken();
  await resetToken.ensureResetTokenTableExist();

  console.log("Database tables checked/created successfully!");
  pool.end();
};

// use node setupDb.js
setupDatabase();
