const prisma = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

exports.createBooking = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const {
      eventId,
      ticketItems, // [{ ticketTypeId, quantity }]
      attendees,   // [{ name, email, phone, ticketType }]
      promoCode
    } = req.body;

    const userId = req.user.userId;

    // Validate event exists and is bookable
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { isActive: true }
        }
      }
=======
    const { ticketId, quantity } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const booking = await Booking.create({
      userId: req.user.id,      // make sure Booking model has userId as foreign key
      ticketId: ticket.id,      // Booking model should have ticketId as foreign key
      quantity,
      totalPrice: ticket.price * quantity,
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    // Calculate totals and validate ticket availability
    let subtotal = 0;
    const bookingItems = [];

    for (const item of ticketItems) {
      const ticketType = event.ticketTypes.find(tt => tt.id === item.ticketTypeId);
      
      if (!ticketType) {
        return res.status(400).json({ message: `Ticket type not found: ${item.ticketTypeId}` });
      }

      if (ticketType.qtyAvailable < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough tickets available for ${ticketType.name}. Available: ${ticketType.qtyAvailable}` 
        });
      }

      const itemTotal = ticketType.price * item.quantity;
      subtotal += itemTotal;

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
      // TODO: Implement promo code logic
      // const promotion = await prisma.promotion.findUnique({...});
    }

    // Calculate fees and taxes (2% processing fee)
    const fees = subtotal * 0.02;
    const taxes = 0; // Implement tax calculation if needed
    const total = subtotal - discount + fees + taxes;

    // Generate unique booking code
    const bookingCode = `VV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          eventId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          discount,
          fees,
          taxes,
          total,
          currency: 'INR',
          promoCode,
          items: {
            create: bookingItems
          },
          attendees: {
            create: attendees.map(attendee => ({
              ...attendee,
              qrCode: uuidv4()
            }))
          }
        },
        include: {
          items: {
            include: {
              ticketType: true
            }
          },
          attendees: true,
          event: {
            select: {
              title: true,
              startAt: true,
              endAt: true,
              venueName: true,
              city: true
            }
          }
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

      // Update event booking count
      await tx.event.update({
        where: { id: eventId },
        data: {
          bookingsCount: {
            increment: 1
          }
        }
      });

      return newBooking;
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      userId,
      ...(status && { status })
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startAt: true,
              endAt: true,
              venueName: true,
              city: true,
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          items: {
            include: {
              ticketType: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          },
          attendees: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get user bookings error:', err);
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
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
        attendees: true,
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Get booking by ID error:', err);
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        items: true,
        event: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
    }

    // Check if event allows cancellation (e.g., not within 24 hours)
    const eventStart = new Date(booking.event.startAt);
    const now = new Date();
    const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking within 24 hours of event start' 
      });
    }

    // Update booking and restore ticket availability
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
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

      // Update event booking count
      await tx.event.update({
        where: { id: booking.eventId },
        data: {
          bookingsCount: {
            decrement: 1
          }
        }
      });

      return updated;
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    next(err);
  }
};
