const prisma = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

exports.createBooking = async (req, res, next) => {
  try {
    const {
      eventId,
      ticketItems, // [{ ticketTypeId, quantity }]
      promoCode
    } = req.body;
    const userId = req.user.userId;

    // Validate event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    // Validate ticket availability
    let subtotal = 0;
    const bookingItems = [];

    for (const item of ticketItems) {
      const ticketType = event.ticketTypes.find(t => t.id === item.ticketTypeId);
      
      if (!ticketType) {
        return res.status(400).json({ message: `Ticket type ${item.ticketTypeId} not found` });
      }

      if (!ticketType.isActive) {
        return res.status(400).json({ message: `Ticket type ${ticketType.name} is not available` });
      }

      if (ticketType.qtyAvailable < item.quantity) {
        return res.status(400).json({ 
          message: `Only ${ticketType.qtyAvailable} tickets available for ${ticketType.name}` 
        });
      }

      const itemTotal = ticketType.price * item.quantity;
      subtotal += parseFloat(itemTotal);

      bookingItems.push({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: ticketType.price,
        totalPrice: itemTotal
      });
    }

    // Apply promo code if provided
    let discount = 0;
    if (promoCode) {
      const promotion = await prisma.promotion.findUnique({
        where: { code: promoCode }
      });

      if (promotion && promotion.isActive) {
        const now = new Date();
        if (promotion.validFrom <= now && promotion.validTo >= now) {
          if (promotion.discountType === 'PERCENTAGE') {
            discount = (subtotal * promotion.value) / 100;
            if (promotion.maxDiscount && discount > promotion.maxDiscount) {
              discount = parseFloat(promotion.maxDiscount);
            }
          } else {
            discount = parseFloat(promotion.value);
          }
        }
      }
    }

    const fees = subtotal * 0.03; // 3% platform fee
    const taxes = (subtotal - discount + fees) * 0.18; // 18% GST
    const total = subtotal - discount + fees + taxes;

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          bookingCode: `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          userId,
          eventId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          discount,
          fees,
          taxes,
          total,
          promoCode,
          items: {
            create: bookingItems
          }
        },
        include: {
          items: {
            include: {
              ticketType: true
            }
          },
          event: true,
          user: true
        }
      });

      // Update ticket availability
      for (const item of ticketItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            qtyAvailable: {
              decrement: item.quantity
            }
          }
        });
      }

      return newBooking;
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          event: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          items: {
            include: {
              ticketType: true
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get user bookings error:', err);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        items: {
          include: {
            ticketType: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        attendees: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is the event organizer
    if (booking.userId !== userId && booking.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);

  } catch (err) {
    console.error('Get booking by ID error:', err);
    res.status(500).json({ message: 'Failed to get booking' });
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        items: true,
        event: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if event has started
    const now = new Date();
    if (booking.event.startAt <= now) {
      return res.status(400).json({ message: 'Cannot cancel booking for past events' });
    }

    // Update booking and restore ticket availability
    await prisma.$transaction(async (tx) => {
      // Cancel booking
      await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED'
        }
      });

      // Restore ticket availability
      for (const item of booking.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            qtyAvailable: {
              increment: item.quantity
            }
          }
        });
      }
    });

    res.json({ message: 'Booking cancelled successfully' });

  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

exports.getEventBookings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 20, status } = req.query;

    // Check if user is the event organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view event bookings' });
    }

    const skip = (page - 1) * limit;
    const where = { eventId };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              ticketType: true
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get event bookings error:', err);
    res.status(500).json({ message: 'Failed to get event bookings' });
  }
};