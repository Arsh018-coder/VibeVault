const QRCode = require("qrcode");

exports.generateQRCode = async (text) => {
  try {
    const qr = await QRCode.toDataURL(text); // base64 string
    return qr;
  } catch (err) {
    console.error("QR Code generation failed:", err);
    throw err;
  }
};