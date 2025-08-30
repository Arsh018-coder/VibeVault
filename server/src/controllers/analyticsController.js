const { Op } = require('sequelize');
const Payment = require('../models/payment');

exports.getSalesReport = async (req, res, next) => {
  try {
    const totalSales = await Payment.sum('amount', {
      where: { status: 'completed' }
    });

    res.json({ totalSales: totalSales || 0 });
  } catch (err) {
    next(err);
  }
};
