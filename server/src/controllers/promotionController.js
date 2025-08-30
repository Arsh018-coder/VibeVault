const prisma = require('../db/prisma');

exports.validatePromoCode = async (req, res, next) => {
  try {
    const { code, eventId, totalAmount, userId } = req.body;

    const promotion = await prisma.promotion.findUnique({
      where: { code },
      include: {
        events: {
          where: { eventId }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid promotion code' 
      });
    }

    if (!promotion.isActive) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promotion code is not active' 
      });
    }

    const now = new Date();

    // Check validity period
    if (promotion.validFrom && promotion.validFrom > now) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promotion code is not yet valid' 
      });
    }

    if (promotion.validTo && promotion.validTo < now) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promotion code has expired' 
      });
    }

    // Check usage limits
    if (promotion.totalLimit && promotion.totalLimit <= 0) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promotion code usage limit reached' 
      });
    }

    // Check minimum amount
    if (promotion.minimumAmount && totalAmount < promotion.minimumAmount) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum order amount is ₹${promotion.minimumAmount}` 
      });
    }

    // Check event-specific promotion
    if (eventId && promotion.events.length > 0 && !promotion.events.some(e => e.eventId === eventId)) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Promotion code is not valid for this event' 
      });
    }

    // Check per-user limit
    if (promotion.perUserLimit && userId) {
      const userUsageCount = await prisma.booking.count({
        where: {
          userId,
          promoCode: code,
          status: { not: 'CANCELLED' }
        }
      });

      if (userUsageCount >= promotion.perUserLimit) {
        return res.status(400).json({ 
          valid: false, 
          message: 'You have reached the usage limit for this promotion code' 
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * promotion.value) / 100;
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = parseFloat(promotion.maxDiscount);
      }
    } else {
      discountAmount = parseFloat(promotion.value);
    }

    const discountedAmount = Math.max(0, totalAmount - discountAmount);

    res.json({ 
      valid: true,
      discountAmount,
      discountedAmount,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        value: promotion.value,
        maxDiscount: promotion.maxDiscount
      }
    });

  } catch (err) {
    console.error('Validate promo code error:', err);
    res.status(500).json({ message: 'Failed to validate promotion code' });
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
      userType,
      eventIds = []
    } = req.body;
    const userId = req.user.userId;

    // Check if user has permission (admin or organizer)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to create promotions' });
    }

    // Check if code already exists
    const existingPromo = await prisma.promotion.findUnique({
      where: { code }
    });

    if (existingPromo) {
      return res.status(400).json({ message: 'Promotion code already exists' });
    }

    // Create promotion with transaction
    const promotion = await prisma.$transaction(async (tx) => {
      const newPromotion = await tx.promotion.create({
        data: {
          code: code.toUpperCase(),
          name,
          description,
          discountType,
          value: parseFloat(value),
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          validFrom: validFrom ? new Date(validFrom) : null,
          validTo: validTo ? new Date(validTo) : null,
          totalLimit: totalLimit ? parseInt(totalLimit) : null,
          perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
          minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null,
          minimumQuantity: minimumQuantity ? parseInt(minimumQuantity) : null,
          userType,
          isActive: true
        }
      });

      // Link to specific events if provided
      if (eventIds.length > 0) {
        await tx.eventPromotion.createMany({
          data: eventIds.map(eventId => ({
            eventId,
            promotionId: newPromotion.id
          }))
        });
      }

      return newPromotion;
    });

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });

  } catch (err) {
    console.error('Create promotion error:', err);
    res.status(500).json({ message: 'Failed to create promotion' });
  }
};

exports.getPromotions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive, eventId } = req.query;
    const userId = req.user.userId;

    // Check if user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to view promotions' });
    }

    const skip = (page - 1) * limit;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (eventId) {
      where.events = {
        some: { eventId }
      };
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          events: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.promotion.count({ where })
    ]);

    res.json({
      promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get promotions error:', err);
    res.status(500).json({ message: 'Failed to get promotions' });
  }
};

exports.getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to view promotions' });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startAt: true
              }
            }
          }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Get usage statistics
    const usageStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        promoCode: promotion.code
      },
      _count: {
        status: true
      },
      _sum: {
        discount: true
      }
    });

    res.json({
      promotion,
      usageStats
    });

  } catch (err) {
    console.error('Get promotion by ID error:', err);
    res.status(500).json({ message: 'Failed to get promotion' });
  }
};

exports.updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    // Check if user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to update promotions' });
    }

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!existingPromotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Convert dates and numbers
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validTo) {
      updateData.validTo = new Date(updateData.validTo);
    }
    if (updateData.value) {
      updateData.value = parseFloat(updateData.value);
    }
    if (updateData.maxDiscount) {
      updateData.maxDiscount = parseFloat(updateData.maxDiscount);
    }
    if (updateData.totalLimit) {
      updateData.totalLimit = parseInt(updateData.totalLimit);
    }
    if (updateData.perUserLimit) {
      updateData.perUserLimit = parseInt(updateData.perUserLimit);
    }
    if (updateData.minimumAmount) {
      updateData.minimumAmount = parseFloat(updateData.minimumAmount);
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Promotion updated successfully',
      promotion: updatedPromotion
    });

  } catch (err) {
    console.error('Update promotion error:', err);
    res.status(500).json({ message: 'Failed to update promotion' });
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user has permission (admin only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete promotions' });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Check if promotion has been used
    const usageCount = await prisma.booking.count({
      where: {
        promoCode: promotion.code,
        status: { not: 'CANCELLED' }
      }
    });

    if (usageCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete promotion that has been used. Deactivate instead.' 
      });
    }

    await prisma.promotion.delete({
      where: { id }
    });

    res.json({ message: 'Promotion deleted successfully' });

  } catch (err) {
    console.error('Delete promotion error:', err);
    res.status(500).json({ message: 'Failed to delete promotion' });
  }
};

exports.togglePromotionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to modify promotions' });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: {
        isActive: !promotion.isActive
      }
    });

    res.json({
      message: `Promotion ${updatedPromotion.isActive ? 'activated' : 'deactivated'} successfully`,
      promotion: updatedPromotion
    });

  } catch (err) {
    console.error('Toggle promotion status error:', err);
    res.status(500).json({ message: 'Failed to toggle promotion status' });
  }
};