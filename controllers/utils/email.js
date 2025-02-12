const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Reset Password Request",
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <p>To reset your password, please click the link below:</p>
      <p><a href="our-hotel-managment-system.vercel.app/reset-password/${resetToken}">Reset Password</a></p>
      <p>The link will expire in 1 hour.</p>
      <p>If you need further assistance, please contact our support team.</p>
      <p>Best regards,<br> <strong>UMER ALI SHER</strong></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending reset password email:", error.message);
    throw new Error("Could not send reset password email. Please try again.");
  }
};

module.exports = { sendResetPasswordEmail };
