const twilio = require("twilio");
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = require("../config/environment");

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

exports.sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      from: TWILIO_PHONE,
      to,
      body: message,
    });
    console.log(`SMS sent to ${to}`);
  } catch (err) {
    console.error("SMS sending failed:", err);
    throw err;
  }
};
