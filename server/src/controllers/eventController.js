const prisma = require('../db/prisma');

exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      startAt,
      endAt,
      timezone,
      isVirtual,
      venueName,
      street,
      city,
      state,
      zipCode,
      country,
      virtualLink,
      capacity,
      featured,
      visibility = 'PUBLIC'
    } = req.body;

    const organizerId = req.user.userId;

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        organizerId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        timezone,
        isVirtual,
        venueName,
        street,
        city,
        state,
        zipCode,
        country,
        virtualLink,
        capacity,
        featured,
        visibility,
        status: 'DRAFT'
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true
      }
    });

    res.status(201).json({ message: 'Event created', event });

  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      featured,
      upcoming,
      city,
      status = 'PUBLISHED'
    } = req.query;

    const skip = (page - 1) * limit;
    const where = { status };

    // Add filters
    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (upcoming === 'true') {
      where.startAt = { gte: new Date() };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          category: true,
          ticketTypes: {
            select: {
              id: true,
              name: true,
              price: true,
              qtyAvailable: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          startAt: 'asc'
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Failed to get events' });
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true,
        ticketTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        images: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment views
    await prisma.event.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json(event);

  } catch (err) {
    console.error('Get event by ID error:', err);
    res.status(500).json({ message: 'Failed to get event' });
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Check if user owns the event
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update dates if provided
    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt);
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt);
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        category: true,
        ticketTypes: true
      }
    });

    res.json({ message: 'Event updated', event });

  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user owns the event
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });

  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

exports.getOrganizerEvents = async (req, res, next) => {
  try {
    const organizerId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;
    const where = { organizerId };

    if (status) {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          category: true,
          ticketTypes: true,
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get organizer events error:', err);
    res.status(500).json({ message: 'Failed to get organizer events' });
  }
};