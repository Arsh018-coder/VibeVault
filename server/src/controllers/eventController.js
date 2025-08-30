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
      visibility = 'PUBLIC',
      ticketTypes = []
    } = req.body;

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create event with ticket types
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        organizerId: req.user.userId,
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
        visibility,
        status: 'DRAFT',
        ticketTypes: {
          create: ticketTypes.map(ticket => ({
            type: ticket.type || 'GENERAL',
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            currency: ticket.currency || 'INR',
            qtyTotal: ticket.quantity,
            qtyAvailable: ticket.quantity,
            perUserLimit: ticket.perUserLimit || 10,
            saleStart: ticket.saleStart ? new Date(ticket.saleStart) : null,
            saleEnd: ticket.saleEnd ? new Date(ticket.saleEnd) : null
          }))
        }
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
        category: true,
        ticketTypes: true,
        images: true
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (err) {
    console.error('Create event error:', err);
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      status = 'PUBLISHED',
      featured,
      trending
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      status,
      ...(category && { categoryId: category }),
      ...(featured && { featured: featured === 'true' }),
      ...(trending && { trending: trending === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
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
            orderBy: { price: 'asc' },
            take: 1
          },
          images: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { trending: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get events error:', err);
    next(err);
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
          select: { bookings: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    await prisma.event.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json(event);
  } catch (err) {
    console.error('Get event by ID error:', err);
    next(err);
  }
};

exports.getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { slug },
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
          select: { bookings: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    await prisma.event.update({
      where: { slug },
      data: { views: { increment: 1 } }
    });

    res.json(event);
  } catch (err) {
    console.error('Get event by slug error:', err);
    next(err);
  }
};