const nodemailer = require("nodemailer");
require('dotenv').config();

// Create a reusable transporter object using the SMTP transport
const createTransporter = () => {
  // Use environment variables for SMTP configuration
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Only validate certs in production
    }
  };

  // If using Ethereal for development, create a test account
  if (smtpConfig.host.includes('ethereal.email') && !smtpConfig.auth.user) {
    return nodemailer.createTestAccount().then(testAccount => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    });
  }

  return nodemailer.createTransport(smtpConfig);
};

// Create a single reusable transporter
const transporterPromise = createTransporter();

exports.sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await transporterPromise;
    const from = process.env.EMAIL_FROM || 'noreply@vibevault.com';
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"VibeVault" <${from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject || 'No Subject',
      text: text || '',
      html: html || text || '',
    });

    // Log email info in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Message sent: %s', info.messageId);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL: %s', previewUrl);
      }
    }
    
    return info;
  } catch (err) {
    console.error('Email sending failed:', err);
    throw err;
  }
};