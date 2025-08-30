const twilio = require("twilio");
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP } = require("../config/environment");

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

exports.sendWhatsApp = async (to, message) => {
  try {
    await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP}`,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`WhatsApp sent to ${to}`);
  } catch (err) {
    console.error("WhatsApp sending failed:", err);
    throw err;
  }
};
