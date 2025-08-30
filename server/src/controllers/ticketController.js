const prisma = require('../db/prisma');
const { Prisma } = require('@prisma/client');

exports.createTicketType = async (req, res, next) => {
  try {
    const {
      eventId,
      type,
      name,
      description,
      price,
      qtyTotal,
      perUserLimit = 1,
      saleStart,
      saleEnd
    } = req.body;
    const userId = req.user.userId;

    // Check if user owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to create tickets for this event' });
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId,
        type,
        name,
        description,
        price: parseFloat(price),
        qtyTotal: parseInt(qtyTotal),
        qtyAvailable: parseInt(qtyTotal),
        perUserLimit: parseInt(perUserLimit),
        saleStart: saleStart ? new Date(saleStart) : null,
        saleEnd: saleEnd ? new Date(saleEnd) : null,
        isActive: true
      },
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Ticket type created successfully',
      ticketType
    });

  } catch (err) {
    console.error('Create ticket type error:', err);
    res.status(500).json({ message: 'Failed to create ticket type' });
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
            id: true,
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
    res.status(500).json({ message: 'Failed to get ticket type' });
  }
};

exports.getEventTicketTypes = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { includeInactive = false } = req.query;

    const where = { eventId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const ticketTypes = await prisma.ticketType.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            status: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    });

    res.json(ticketTypes);

  } catch (err) {
    console.error('Get event ticket types error:', err);
    res.status(500).json({ message: 'Failed to get ticket types' });
  }
};

exports.updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    // Check if user owns the event
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

    if (ticketType.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this ticket type' });
    }

    // Convert dates if provided
    if (updateData.saleStart) {
      updateData.saleStart = new Date(updateData.saleStart);
    }
    if (updateData.saleEnd) {
      updateData.saleEnd = new Date(updateData.saleEnd);
    }

    // Convert numbers if provided
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.qtyTotal) {
      updateData.qtyTotal = parseInt(updateData.qtyTotal);
      // Update available quantity if total is increased
      const currentSold = ticketType.qtyTotal - ticketType.qtyAvailable;
      updateData.qtyAvailable = updateData.qtyTotal - currentSold;
    }
    if (updateData.perUserLimit) {
      updateData.perUserLimit = parseInt(updateData.perUserLimit);
    }

    const updatedTicketType = await prisma.ticketType.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      message: 'Ticket type updated successfully',
      ticketType: updatedTicketType
    });

  } catch (err) {
    console.error('Update ticket type error:', err);
    res.status(500).json({ message: 'Failed to update ticket type' });
  }
};

exports.deleteTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user owns the event
    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            organizerId: true
          }
        },
        bookingItems: true
      }
    });

    if (!ticketType) {
      return res.status(404).json({ message: 'Ticket type not found' });
    }

    if (ticketType.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this ticket type' });
    }

    // Check if there are any bookings for this ticket type
    if (ticketType.bookingItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete ticket type with existing bookings. Deactivate instead.' 
      });
    }

    await prisma.ticketType.delete({
      where: { id }
    });

    res.json({ message: 'Ticket type deleted successfully' });

  } catch (err) {
    console.error('Delete ticket type error:', err);
    res.status(500).json({ message: 'Failed to delete ticket type' });
  }
};

// Get all tickets purchased by the current user
exports.getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const tickets = await prisma.ticket.findMany({
      where: {
        userId,
        status: { not: 'CANCELLED' }
      },
      include: {
        ticketType: {
          include: {
            event: {
              include: {
                venue: true,
                organizer: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paidAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend's expected format
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      event: {
        id: ticket.ticketType.event.id,
        title: ticket.ticketType.event.title,
        startTime: ticket.ticketType.event.startTime,
        endTime: ticket.ticketType.event.endTime,
        imageUrl: ticket.ticketType.event.imageUrl,
        venue: ticket.ticketType.event.venue,
        organizer: ticket.ticketType.event.organizer
      },
      ticketType: {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: ticket.ticketType.price
      },
      quantity: ticket.quantity,
      status: ticket.status,
      createdAt: ticket.createdAt,
      payment: ticket.payment
    }));

    res.json(formattedTickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    next(error);
  }
};

exports.toggleTicketTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user owns the event
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

    if (ticketType.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this ticket type' });
    }

    const updatedTicketType = await prisma.ticketType.update({
      where: { id },
      data: {
        isActive: !ticketType.isActive
      }
    });

    res.json({
      message: `Ticket type ${updatedTicketType.isActive ? 'activated' : 'deactivated'} successfully`,
      ticketType: updatedTicketType
    });

  } catch (err) {
    console.error('Toggle ticket type status error:', err);
    res.status(500).json({ message: 'Failed to toggle ticket type status' });
  }
};

exports.checkTicketAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        qtyAvailable: true,
        perUserLimit: true,
        isActive: true,
        saleStart: true,
        saleEnd: true,
        event: {
          select: {
            status: true,
            startAt: true
          }
        }
      }
    });

    if (!ticketType) {
      return res.status(404).json({ message: 'Ticket type not found' });
    }

    const now = new Date();
    let available = true;
    let message = 'Ticket is available';

    // Check various availability conditions
    if (!ticketType.isActive) {
      available = false;
      message = 'Ticket type is not active';
    } else if (ticketType.event.status !== 'PUBLISHED') {
      available = false;
      message = 'Event is not published';
    } else if (ticketType.event.startAt <= now) {
      available = false;
      message = 'Event has already started';
    } else if (ticketType.saleStart && ticketType.saleStart > now) {
      available = false;
      message = 'Ticket sale has not started yet';
    } else if (ticketType.saleEnd && ticketType.saleEnd < now) {
      available = false;
      message = 'Ticket sale has ended';
    } else if (ticketType.qtyAvailable < parseInt(quantity)) {
      available = false;
      message = `Only ${ticketType.qtyAvailable} tickets available`;
    } else if (parseInt(quantity) > ticketType.perUserLimit) {
      available = false;
      message = `Maximum ${ticketType.perUserLimit} tickets per user`;
    }

    res.json({
      available,
      message,
      ticketType: {
        id: ticketType.id,
        name: ticketType.name,
        price: ticketType.price,
        qtyAvailable: ticketType.qtyAvailable,
        perUserLimit: ticketType.perUserLimit
      }
    });

  } catch (err) {
    console.error('Check ticket availability error:', err);
    res.status(500).json({ message: 'Failed to check ticket availability' });
  }
};