/**
 * Generate a numeric OTP of given length
 * @param {number} length - Length of the OTP (default 6)
 * @returns {string} OTP
 */
function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // random digit between 0-9
    }
    return otp;
}

module.exports = { generateOTP };
