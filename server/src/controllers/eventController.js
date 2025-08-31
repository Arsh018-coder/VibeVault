const prisma = require('../db/prisma');
const { Prisma } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/events');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `event-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadEventImages = upload.array('images', 10);

exports.processEventImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Process uploaded files and attach to request
    req.uploadedImages = req.files.map(file => ({
      url: `/uploads/events/${file.filename}`,
      alt: file.originalname,
      isPrimary: false
    }));

    // Set first image as primary
    if (req.uploadedImages.length > 0) {
      req.uploadedImages[0].isPrimary = true;
    }

    next();
  } catch (err) {
    next(err);
  }
};

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
      visibility = 'PUBLIC',
      ticketTypes = [],
      images = []
    } = req.body;

    const organizerId = req.user.id;

    // Generate slug from title
    let baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Combine uploaded images with any existing images
    const eventImages = req.uploadedImages || [];
    if (Array.isArray(images) && images.length > 0) {
      eventImages.push(...images);
    }

    // Create event with ticket types and images in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the event
      const event = await tx.event.create({
        data: {
          title,
          slug,
          description,
          categoryId: categoryId || null,
          organizerId,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          timezone: timezone || 'Asia/Kolkata',
          isVirtual: Boolean(isVirtual),
          venueName,
          street,
          city,
          state,
          zipCode,
          country,
          virtualLink,
          capacity: capacity ? parseInt(capacity) : null,
          featured: Boolean(featured),
          visibility,
          status: 'DRAFT',
          images: eventImages.length > 0 ? {
            create: eventImages
          } : undefined
        },
        include: {
          images: true
        }
      });

      // Create ticket types if provided
      if (ticketTypes && ticketTypes.length > 0) {
        const ticketTypesData = ticketTypes.map(ticket => ({
          eventId: event.id,
          type: ticket.type || 'GENERAL',
          name: ticket.name,
          description: ticket.description || '',
          price: parseFloat(ticket.price) || 0,
          currency: ticket.currency || 'INR',
          qtyTotal: parseInt(ticket.qtyTotal) || 0,
          qtyAvailable: parseInt(ticket.qtyAvailable) || parseInt(ticket.qtyTotal) || 0,
          saleStart: ticket.saleStart ? new Date(ticket.saleStart) : null,
          saleEnd: ticket.saleEnd ? new Date(ticket.saleEnd) : null,
          perUserLimit: parseInt(ticket.perUserLimit) || 1,
          isActive: ticket.isActive !== false
        }));

        await tx.ticketType.createMany({
          data: ticketTypesData
        });
      }

      // Return the complete event with ticket types
      return await tx.event.findUnique({
        where: { id: event.id },
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
          ticketTypes: true
        }
      });
    });

    res.status(201).json({ message: 'Event created successfully', event: result });

  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ 
      message: err.message || 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    const userId = req.user.id;
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
    const userId = req.user.id;

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
    const organizerId = req.user.id;
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

// Alias methods for route compatibility
exports.getAllEvents = exports.getEvents;

exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        featured: true,
        startAt: { gte: new Date() }
      },
      take: 6,
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
          },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      orderBy: {
        startAt: 'asc'
      }
    });

    res.json({ events });

  } catch (err) {
    console.error('Get featured events error:', err);
    res.status(500).json({ message: 'Failed to get featured events' });
  }
};

exports.searchEvents = async (req, res, next) => {
  try {
    const { q, category, city, date } = req.query;
    
    const where = {
      status: 'PUBLISHED',
      startAt: { gte: new Date() }
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.startAt = {
        gte: searchDate,
        lt: nextDay
      };
    }

    const events = await prisma.event.findMany({
      where,
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
          },
          orderBy: { price: 'asc' }
        }
      },
      orderBy: {
        startAt: 'asc'
      }
    });

    res.json({ events });

  } catch (err) {
    console.error('Search events error:', err);
    res.status(500).json({ message: 'Failed to search events' });
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
      where: { slug },
      data: { views: { increment: 1 } }
    });

    res.json({ event });

  } catch (err) {
    console.error('Get event by slug error:', err);
    res.status(500).json({ message: 'Failed to get event' });
  }
};

exports.getEventTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ticketTypes = await prisma.ticketType.findMany({
      where: { 
        eventId: id,
        isActive: true
      },
      orderBy: { price: 'asc' }
    });

    res.json({ ticketTypes });

  } catch (err) {
    console.error('Get event tickets error:', err);
    res.status(500).json({ message: 'Failed to get event tickets' });
  }
};

exports.updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if user owns the event
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Event status updated', event });

  } catch (err) {
    console.error('Update event status error:', err);
    res.status(500).json({ message: 'Failed to update event status' });
  }
};

// Get organizer dashboard data
exports.getOrganizerDashboard = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    
    // Get total number of events
    const totalEvents = await prisma.event.count({
      where: { organizerId }
    });
    
    // Get upcoming events (next 30 days)
    const upcomingEvents = await prisma.event.count({
      where: {
        organizerId,
        startAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      }
    });
    
    // Get total tickets sold
    const ticketsSold = await prisma.ticket.aggregate({
      where: {
        ticketType: {
          event: { 
            organizerId,
            deletedAt: null // Only count tickets for non-deleted events
          },
          deletedAt: null // Only count non-deleted ticket types
        },
        status: 'CONFIRMED',
        deletedAt: null // Only count non-deleted tickets
      },
      _sum: {
        quantity: true
      }
    }).catch(error => {
      console.error('Error aggregating tickets:', error);
      return { _sum: { quantity: 0 } }; // Return default value on error
    });
    
    // Get recent events with ticket sales
    const recentEvents = await prisma.event.findMany({
      where: { 
        organizerId,
        startAt: { gte: new Date() }, // Only upcoming events
        status: 'ACTIVE', // Only active events
        deletedAt: null // Not deleted
      },
      orderBy: { startAt: 'asc' },
      take: 5, // Limit to 5 most recent events
      include: {
        ticketTypes: {
          where: {
            deletedAt: null // Only include non-deleted ticket types
          },
          select: {
            id: true,
            name: true,
            price: true,
            _count: {
              select: { 
                tickets: { 
                  where: { 
                    status: 'CONFIRMED',
                    deletedAt: null // Only count non-deleted tickets
                  } 
                } 
              }
            }
          }
        },
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            country: true
          }
        }
      }
    }).catch(error => {
      console.error('Error fetching recent events:', error);
      return []; // Return empty array on error
    });
    
    // Format the response
    const dashboardData = {
      stats: {
        totalEvents,
        upcomingEvents,
        ticketsSold: ticketsSold._sum.quantity || 0,
        totalRevenue: 0 // This would require payment data
      },
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        imageUrl: event.imageUrl,
        status: event.status,
        venue: event.venue,
        category: event.category,
        ticketTypes: event.ticketTypes.map(type => ({
          id: type.id,
          name: type.name,
          price: type.price,
          ticketsSold: type._count.tickets
        }))
      }))
    };
    
    // Calculate total revenue
    dashboardData.stats.totalRevenue = recentEvents.reduce((total, event) => {
      return total + event.ticketTypes.reduce((eventTotal, type) => {
        return eventTotal + (type.price * (type._count?.tickets || 0));
      }, 0);
    }, 0);

    res.json(dashboardData);
    
  } catch (error) {
    console.error('Error fetching organizer dashboard data:', error);
    next(error);
  }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true, featured: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { featured: !event.featured }
    });

    res.json({ message: 'Event featured status updated', event: updatedEvent });
  } catch (err) {
    console.error('Toggle featured error:', err);
    res.status(500).json({ message: 'Failed to toggle featured status' });
  }
};

// Add images to an event
exports.addEventImages = [
upload.array('images', 10), // Allow up to 10 images
async (req, res, next) => {
try {
const { eventId } = req.params;
  
if (!req.files || req.files.length === 0) {
  return res.status(400).json({ message: 'No images uploaded' });
}

// Check if event exists
const event = await prisma.event.findUnique({
  where: { id: eventId },
  include: { images: true }
});

if (!event) {
  return res.status(404).json({ message: 'Event not found' });
}

// Process uploaded files
const images = req.files.map(file => ({
  url: `/uploads/events/${file.filename}`,
  alt: file.originalname,
  isPrimary: false
}));

// Add images to event
const savedImages = await Promise.all(
  images.map(img => 
    prisma.eventImage.create({
      data: {
        ...img,
        eventId
      }
    })
  )
);

res.status(201).json({
  message: 'Images added to event successfully',
  images: savedImages
});
} catch (err) {
next(err);
}
}
];

// Set primary image for an event
exports.setPrimaryImage = async (req, res, next) => {
try {
const { eventId, imageId } = req.params;

// Start a transaction
await prisma.$transaction([
  // Reset all images to non-primary
  prisma.eventImage.updateMany({
    where: { eventId, isPrimary: true },
    data: { isPrimary: false }
  }),
  
  // Set the selected image as primary
  prisma.eventImage.update({
    where: { id: imageId, eventId },
    data: { isPrimary: true }
  })
]);

res.json({ message: 'Primary image updated successfully' });
} catch (err) {
next(err);
}
};

// Delete an event image
exports.deleteEventImage = async (req, res, next) => {
try {
const { imageId } = req.params;
  
// Find the image first to get the file path
const image = await prisma.eventImage.findUnique({
  where: { id: imageId }
});

if (!image) {
  return res.status(404).json({ message: 'Image not found' });
}

// Delete from database
await prisma.eventImage.delete({
  where: { id: imageId }
});

// Delete the actual file
const filePath = path.join(__dirname, '../../public', image.url);
try {
  await fs.unlink(filePath);
} catch (err) {
  console.error('Error deleting image file:', err);
  // Continue even if file deletion fails
}

res.json({ message: 'Image deleted successfully' });
} catch (err) {
next(err);
}
};

// Image upload functionality is now handled at the top of the file