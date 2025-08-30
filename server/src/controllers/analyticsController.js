const prisma = require('../db/prisma');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    let whereClause = {};
    if (user.role === 'ORGANIZER') {
      whereClause.organizerId = userId;
    }

    // Get basic stats
    const [
      totalEvents,
      totalBookings,
      totalRevenue,
      activeEvents,
      recentBookings,
      topEvents
    ] = await Promise.all([
      // Total events
      prisma.event.count({
        where: {
          ...whereClause,
          createdAt: { gte: startDate }
        }
      }),
      
      // Total bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
          ...(user.role === 'ORGANIZER' && {
            event: { organizerId: userId }
          })
        }
      }),
      
      // Total revenue
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'CONFIRMED',
          paymentStatus: 'SUCCESS',
          ...(user.role === 'ORGANIZER' && {
            event: { organizerId: userId }
          })
        },
        _sum: { total: true }
      }),
      
      // Active events
      prisma.event.count({
        where: {
          ...whereClause,
          status: 'PUBLISHED',
          startAt: { gte: now }
        }
      }),
      
      // Recent bookings
      prisma.booking.findMany({
        where: {
          createdAt: { gte: startDate },
          ...(user.role === 'ORGANIZER' && {
            event: { organizerId: userId }
          })
        },
        include: {
          event: {
            select: {
              id: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Top performing events
      prisma.event.findMany({
        where: {
          ...whereClause,
          createdAt: { gte: startDate }
        },
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  status: { not: 'CANCELLED' }
                }
              }
            }
          }
        },
        orderBy: {
          bookingsCount: 'desc'
        },
        take: 5
      })
    ]);

    res.json({
      stats: {
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue._sum.total || 0,
        activeEvents
      },
      recentBookings,
      topEvents,
      timeframe
    });

  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
};

exports.getBookingAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { eventId, timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Check user role and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    let whereClause = {
      createdAt: { gte: startDate }
    };

    if (eventId) {
      // Check if user owns the event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true }
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (user.role === 'ORGANIZER' && event.organizerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this event analytics' });
      }

      whereClause.eventId = eventId;
    } else if (user.role === 'ORGANIZER') {
      whereClause.event = { organizerId: userId };
    }

    // Get booking analytics
    const [
      bookingsByStatus,
      bookingsByDate,
      bookingsByTicketType,
      averageBookingValue
    ] = await Promise.all([
      // Bookings by status
      prisma.booking.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true },
        _sum: { total: true }
      }),
      
      // Bookings by date (daily)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as bookings,
          SUM(total) as revenue
        FROM "Booking"
        WHERE created_at >= ${startDate}
        ${eventId ? prisma.$queryRaw`AND event_id = ${eventId}` : prisma.$queryRaw``}
        ${user.role === 'ORGANIZER' && !eventId ? 
          prisma.$queryRaw`AND event_id IN (
            SELECT id FROM "Event" WHERE organizer_id = ${userId}
          )` : prisma.$queryRaw``
        }
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Bookings by ticket type
      prisma.bookingItem.groupBy({
        by: ['ticketTypeId'],
        where: {
          booking: whereClause
        },
        _count: { ticketTypeId: true },
        _sum: { 
          quantity: true,
          totalPrice: true 
        }
      }),
      
      // Average booking value
      prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: { not: 'CANCELLED' }
        },
        _avg: { total: true }
      })
    ]);

    // Get ticket type names
    const ticketTypeIds = bookingsByTicketType.map(item => item.ticketTypeId);
    const ticketTypes = await prisma.ticketType.findMany({
      where: { id: { in: ticketTypeIds } },
      select: { id: true, name: true, type: true }
    });

    const ticketTypeMap = ticketTypes.reduce((acc, tt) => {
      acc[tt.id] = tt;
      return acc;
    }, {});

    // Format ticket type data
    const formattedTicketTypeData = bookingsByTicketType.map(item => ({
      ticketType: ticketTypeMap[item.ticketTypeId],
      bookings: item._count.ticketTypeId,
      quantity: item._sum.quantity,
      revenue: item._sum.totalPrice
    }));

    res.json({
      bookingsByStatus,
      bookingsByDate,
      bookingsByTicketType: formattedTicketTypeData,
      averageBookingValue: averageBookingValue._avg.total || 0,
      timeframe
    });

  } catch (err) {
    console.error('Get booking analytics error:', err);
    res.status(500).json({ message: 'Failed to get booking analytics' });
  }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { eventId, timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Check user role and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    let whereClause = {
      createdAt: { gte: startDate },
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESS'
    };

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true }
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (user.role === 'ORGANIZER' && event.organizerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this event analytics' });
      }

      whereClause.eventId = eventId;
    } else if (user.role === 'ORGANIZER') {
      whereClause.event = { organizerId: userId };
    }

    // Get revenue analytics
    const [
      totalRevenue,
      revenueByDate,
      revenueBreakdown,
      topRevenueEvents
    ] = await Promise.all([
      // Total revenue
      prisma.booking.aggregate({
        where: whereClause,
        _sum: {
          subtotal: true,
          fees: true,
          taxes: true,
          total: true
        },
        _count: { id: true }
      }),
      
      // Revenue by date
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          SUM(subtotal) as subtotal,
          SUM(fees) as fees,
          SUM(taxes) as taxes,
          SUM(total) as total,
          COUNT(*) as bookings
        FROM "Booking"
        WHERE created_at >= ${startDate}
          AND status = 'CONFIRMED'
          AND payment_status = 'SUCCESS'
        ${eventId ? prisma.$queryRaw`AND event_id = ${eventId}` : prisma.$queryRaw``}
        ${user.role === 'ORGANIZER' && !eventId ? 
          prisma.$queryRaw`AND event_id IN (
            SELECT id FROM "Event" WHERE organizer_id = ${userId}
          )` : prisma.$queryRaw``
        }
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Revenue breakdown by components
      prisma.booking.aggregate({
        where: whereClause,
        _sum: {
          subtotal: true,
          discount: true,
          fees: true,
          taxes: true
        }
      }),
      
      // Top revenue generating events
      prisma.event.findMany({
        where: {
          ...(user.role === 'ORGANIZER' && { organizerId: userId }),
          bookings: {
            some: {
              createdAt: { gte: startDate },
              status: 'CONFIRMED',
              paymentStatus: 'SUCCESS'
            }
          }
        },
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  createdAt: { gte: startDate },
                  status: 'CONFIRMED',
                  paymentStatus: 'SUCCESS'
                }
              }
            }
          }
        },
        orderBy: {
          revenue: 'desc'
        },
        take: 10
      })
    ]);

    res.json({
      totalRevenue,
      revenueByDate,
      revenueBreakdown,
      topRevenueEvents,
      timeframe
    });

  } catch (err) {
    console.error('Get revenue analytics error:', err);
    res.status(500).json({ message: 'Failed to get revenue analytics' });
  }
};

exports.getEventPerformance = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Check if event exists and user has permission
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        ticketTypes: true,
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user.role === 'ORGANIZER' && event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this event performance' });
    }

    // Get detailed performance metrics
    const [
      bookingStats,
      revenueStats,
      ticketSales,
      attendeeStats,
      conversionMetrics
    ] = await Promise.all([
      // Booking statistics
      prisma.booking.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { status: true },
        _sum: { total: true }
      }),
      
      // Revenue statistics
      prisma.booking.aggregate({
        where: {
          eventId,
          status: 'CONFIRMED',
          paymentStatus: 'SUCCESS'
        },
        _sum: {
          subtotal: true,
          discount: true,
          fees: true,
          taxes: true,
          total: true
        }
      }),
      
      // Ticket sales by type
      prisma.bookingItem.groupBy({
        by: ['ticketTypeId'],
        where: {
          booking: {
            eventId,
            status: { not: 'CANCELLED' }
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        }
      }),
      
      // Attendee statistics
      prisma.attendee.groupBy({
        by: ['checkedIn'],
        where: {
          booking: { eventId }
        },
        _count: { checkedIn: true }
      }),
      
      // Conversion metrics (views to bookings)
      {
        views: event.views,
        bookings: event._count.bookings,
        conversionRate: event.views > 0 ? (event._count.bookings / event.views * 100) : 0
      }
    ]);

    // Calculate ticket type performance
    const ticketTypePerformance = event.ticketTypes.map(tt => {
      const sales = ticketSales.find(s => s.ticketTypeId === tt.id);
      const soldQuantity = sales?._sum.quantity || 0;
      const revenue = sales?._sum.totalPrice || 0;
      
      return {
        ticketType: tt,
        soldQuantity,
        revenue,
        sellThroughRate: (soldQuantity / tt.qtyTotal) * 100,
        remainingQuantity: tt.qtyAvailable
      };
    });

    res.json({
      event: {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        status: event.status,
        views: event.views
      },
      bookingStats,
      revenueStats,
      ticketTypePerformance,
      attendeeStats,
      conversionMetrics
    });

  } catch (err) {
    console.error('Get event performance error:', err);
    res.status(500).json({ message: 'Failed to get event performance' });
  }
};

exports.exportAnalyticsData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, eventId, timeframe = '30d', format = 'json' } = req.query;

    // Check user permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!['ADMIN', 'ORGANIZER'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to export analytics data' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let data;
    let filename;

    switch (type) {
      case 'bookings':
        data = await prisma.booking.findMany({
          where: {
            createdAt: { gte: startDate },
            ...(eventId && { eventId }),
            ...(user.role === 'ORGANIZER' && !eventId && {
              event: { organizerId: userId }
            })
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startAt: true
              }
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
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
            }
          }
        });
        filename = `bookings_${timeframe}_${Date.now()}`;
        break;
        
      case 'revenue':
        data = await prisma.booking.findMany({
          where: {
            createdAt: { gte: startDate },
            status: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            ...(eventId && { eventId }),
            ...(user.role === 'ORGANIZER' && !eventId && {
              event: { organizerId: userId }
            })
          },
          select: {
            id: true,
            bookingCode: true,
            createdAt: true,
            subtotal: true,
            discount: true,
            fees: true,
            taxes: true,
            total: true,
            event: {
              select: {
                title: true
              }
            }
          }
        });
        filename = `revenue_${timeframe}_${Date.now()}`;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.json({
        data,
        metadata: {
          type,
          timeframe,
          exportedAt: new Date(),
          recordCount: data.length
        }
      });
    }

  } catch (err) {
    console.error('Export analytics data error:', err);
    res.status(500).json({ message: 'Failed to export analytics data' });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}