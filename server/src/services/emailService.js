const nodemailer = require("nodemailer");

// Create a test account with Ethereal Email
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      user: testAccount.user,
      pass: testAccount.pass
    };
  } catch (err) {
    console.error('Failed to create test account:', err);
    throw err;
  }
};

// Create a reusable transporter object using the default SMTP transport
const createTransporter = async () => {
  const testAccount = await createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

exports.sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await createTransporter();
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"VibeVault" <noreply@vibevault.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (err) {
    console.error('Email sending failed:', err);
    throw err;
  }
};