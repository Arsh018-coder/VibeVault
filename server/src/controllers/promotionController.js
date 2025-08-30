const Promotion = require('../models/promotion');

exports.applyPromo = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body;

    // Find active promotion by code
    const promo = await Promotion.findOne({
      where: { code, isActive: true }
    });

    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });

    // Calculate discounted amount
    const discounted = totalAmount - (totalAmount * promo.discount / 100);

    res.json({ discountedAmount: discounted, promo });
  } catch (err) {
    next(err);
  }
};
