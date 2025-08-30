const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/environment");

const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP service
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"Eventify" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
};