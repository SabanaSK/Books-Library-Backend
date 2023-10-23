import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

const sendEmail = async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey", 
      pass: process.env.SENDGRID_API_KEY, 
    },
  });

  if (!req.emailDetails) {
    return res.status(400).json({ message: "Email details not provided" });
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL_USER,
    to: req.emailDetails.to,
    subject: req.emailDetails.subject,
    text: req.emailDetails.body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Error sending email:", error);
    next(error); // Pass the error to the next middleware
  }
};

export default sendEmail;
