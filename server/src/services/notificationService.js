const emailService = require("./emailService");
const smsService = require("./smsService");
const whatsappService = require("./whatsappService");

exports.send = async (user, message, type) => {
  try {
    switch (type) {
      case "email":
        await emailService.sendEmail(user.email, "Notification", message);
        break;
      case "sms":
        await smsService.sendSMS(user.phone, message);
        break;
      case "whatsapp":
        await whatsappService.sendWhatsApp(user.phone, message);
        break;
      default:
        throw new Error("Invalid notification type");
    }
    console.log(`Notification sent via ${type}`);
  } catch (err) {
    console.error("Notification failed:", err);
    throw err;
  }
};
