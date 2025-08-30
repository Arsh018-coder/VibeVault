const prisma = require('../db/prisma');

exports.getTicketsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { includeInactive = false } = req.query;

    const where = {
      eventId,
      ...(includeInactive !== 'true' && { isActive: true })
    };

    const ticketTypes = await prisma.ticketType.findMany({
      where,
      orderBy: { price: 'asc' }
    });

    res.json(ticketTypes);
  } catch (err) {
    console.error('Get tickets by event error:', err);
    next(err);
  }
};

exports.getTicketTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            title: true,
            startAt: true,
            endAt: true,
            status: true
          }
        }
      }
    });

    if (!ticketType) {
      return res.status(404).json({ message: 'Ticket type not found' });
    }

    res.json(ticketType);
  } catch (err) {
    console.error('Get ticket type by ID error:', err);
    next(err);
  }
};

exports.updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      qtyTotal,
      perUserLimit,
      saleStart,
      saleEnd,
      isActive
    } = req.body;

    // Check if ticket type exists and user owns the event
    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    if (!ticketType) {
      return res.status(404).json({ message: 'Ticket type not found' });
    }

    if (ticketType.event.organizerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this ticket type' });
    }

    // Calculate new available quantity if total quantity changed
    let qtyAvailable = ticketType.qtyAvailable;
    if (qtyTotal !== undefined && qtyTotal !== ticketType.qtyTotal) {
      const soldTickets = ticketType.qtyTotal - ticketType.qtyAvailable;
      qtyAvailable = Math.max(0, qtyTotal - soldTickets);
    }

    const updatedTicketType = await prisma.ticketType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(qtyTotal !== undefined && { qtyTotal, qtyAvailable }),
        ...(perUserLimit !== undefined && { perUserLimit }),
        ...(saleStart !== undefined && { saleStart: saleStart ? new Date(saleStart) : null }),
        ...(saleEnd !== undefined && { saleEnd: saleEnd ? new Date(saleEnd) : null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      message: 'Ticket type updated successfully',
      ticketType: updatedTicketType
    });
  } catch (err) {
    console.error('Update ticket type error:', err);
    next(err);
  }
};

exports.getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      booking: {
        userId,
        ...(status && { status })
      }
    };

    const [attendees, total] = await Promise.all([
      prisma.attendee.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          booking: {
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
              }
            }
          }
        },
        orderBy: { booking: { createdAt: 'desc' } }
      }),
      prisma.attendee.count({ where })
    ]);

    res.json({
      tickets: attendees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get user tickets error:', err);
    next(err);
  }
};

exports.checkInAttendee = async (req, res, next) => {
  try {
    const { qrCode } = req.params;

    const attendee = await prisma.attendee.findFirst({
      where: { qrCode },
      include: {
        booking: {
          include: {
            event: {
              select: {
                title: true,
                startAt: true,
                organizerId: true
              }
            }
          }
        }
      }
    });

    if (!attendee) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Check if user is authorized to check in (event organizer)
    if (attendee.booking.event.organizerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to check in attendees for this event' });
    }

    if (attendee.checkedIn) {
      return res.status(400).json({ 
        message: 'Attendee already checked in',
        checkedInAt: attendee.checkedInAt
      });
    }

    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendee.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date()
      }
    });

    res.json({
      message: 'Check-in successful',
      attendee: {
        name: updatedAttendee.name,
        email: updatedAttendee.email,
        ticketType: updatedAttendee.ticketType,
        checkedInAt: updatedAttendee.checkedInAt
      }
    });
  } catch (err) {
    console.error('Check in attendee error:', err);
    next(err);
  }
};