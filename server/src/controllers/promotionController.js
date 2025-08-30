const prisma = require('../db/prisma');

exports.validatePromoCode = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const { code, eventId, totalAmount, userId } = req.body;

    // Find the promotion
    const promotion = await prisma.promotion.findUnique({
      where: { code },
      include: {
        events: {
          where: { eventId }
        }
      }
    });

    if (!promotion || !promotion.isActive) {
      return res.status(404).json({ message: 'Invalid or inactive promo code' });
    }

    // Check if promotion is valid for this event
    if (promotion.events.length === 0) {
      return res.status(400).json({ message: 'Promo code not valid for this event' });
    }

    // Check validity dates
    const now = new Date();
    if (promotion.validFrom && now < promotion.validFrom) {
      return res.status(400).json({ message: 'Promo code not yet active' });
    }
    if (promotion.validTo && now > promotion.validTo) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    // Check minimum amount
    if (promotion.minimumAmount && totalAmount < promotion.minimumAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${promotion.minimumAmount} required` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * promotion.value) / 100;
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else {
      discountAmount = Math.min(promotion.value, totalAmount);
    }

    const finalAmount = totalAmount - discountAmount;

    res.json({
      valid: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        value: promotion.value
      },
      originalAmount: totalAmount,
      discountAmount,
      finalAmount
    });
=======
    const { code, totalAmount } = req.body;

    // Find active promotion by code
    const promo = await Promotion.findOne({
      where: { code, isActive: true }
    });

    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });

    // Calculate discounted amount
    const discounted = totalAmount - (totalAmount * promo.discount / 100);

    res.json({ discountedAmount: discounted, promo });
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
  } catch (err) {
    console.error('Validate promo code error:', err);
    next(err);
  }
};

exports.getPromotions = async (req, res, next) => {
  try {
    const { eventId, isActive = true } = req.query;

    const where = {
      isActive: isActive === 'true',
      ...(eventId && {
        events: {
          some: { eventId }
        }
      })
    };

    const promotions = await prisma.promotion.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        discountType: true,
        value: true,
        maxDiscount: true,
        validFrom: true,
        validTo: true,
        minimumAmount: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(promotions);
  } catch (err) {
    console.error('Get promotions error:', err);
    next(err);
  }
};

exports.createPromotion = async (req, res, next) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      value,
      maxDiscount,
      validFrom,
      validTo,
      totalLimit,
      perUserLimit,
      minimumAmount,
      minimumQuantity,
      eventIds = []
    } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        value,
        maxDiscount,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        totalLimit,
        perUserLimit,
        minimumAmount,
        minimumQuantity,
        isActive: true,
        events: {
          create: eventIds.map(eventId => ({ eventId }))
        }
      },
      include: {
        events: {
          include: {
            event: {
              select: {
                title: true,
                slug: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });
  } catch (err) {
    console.error('Create promotion error:', err);
    next(err);
  }
};
