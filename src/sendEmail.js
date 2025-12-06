import nodemailer from "nodemailer";
import dotenv from "dotenv";

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}
