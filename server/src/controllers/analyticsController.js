const Booking = require('../models/booking');
const Payment = require('../models/payment');

exports.getSalesReport = async (req, res, next) => {
  try {
    const totalSales = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({ totalSales: totalSales[0]?.total || 0 });
  } catch (err) {
    next(err);
  }
};