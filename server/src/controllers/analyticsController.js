const prisma = require('../db/prisma');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole === 'ORGANIZER') {
      // Organizer dashboard stats
      const [
        totalEvents,
        totalBookings,
        totalRevenue,
        upcomingEvents,
        recentBookings
      ] = await Promise.all([
        prisma.event.count({
          where: { organizerId: userId }
        }),
        prisma.booking.count({
          where: {
            event: { organizerId: userId },
            status: 'CONFIRMED'
          }
        }),
        prisma.payment.aggregate({
          where: {
            booking: {
              event: { organizerId: userId }
            },
            status: 'SUCCESS'
          },
          _sum: { amount: true }
        }),
        prisma.event.count({
          where: {
            organizerId: userId,
            startAt: { gte: new Date() },
            status: 'PUBLISHED'
          }
        }),
        prisma.booking.findMany({
          where: {
            event: { organizerId: userId }
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: { title: true }
            },
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        })
      ]);

      res.json({
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        upcomingEvents,
        recentBookings
      });
    } else {
      // Attendee dashboard stats
      const [
        totalBookings,
        upcomingEvents,
        totalSpent,
        recentBookings
      ] = await Promise.all([
        prisma.booking.count({
          where: { userId, status: 'CONFIRMED' }
        }),
        prisma.booking.count({
          where: {
            userId,
            status: 'CONFIRMED',
            event: {
              startAt: { gte: new Date() }
            }
          }
        }),
        prisma.payment.aggregate({
          where: {
            booking: { userId },
            status: 'SUCCESS'
          },
          _sum: { amount: true }
        }),
        prisma.booking.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: {
                title: true,
                startAt: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        })
      ]);

      res.json({
        totalBookings,
        upcomingEvents,
        totalSpent: totalSpent._sum.amount || 0,
        recentBookings
      });
    }
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    next(err);
  }
};

exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Verify user owns the event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: userId
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }

    const [
      bookingStats,
      revenueStats,
      ticketSales,
      attendeeStats
    ] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { _all: true }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { eventId },
          status: 'SUCCESS'
        },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.bookingItem.groupBy({
        by: ['ticketTypeId'],
        where: {
          booking: { eventId }
        },
        _sum: { quantity: true },
        _count: { _all: true }
      }),
      prisma.attendee.count({
        where: {
          booking: { eventId }
        }
      })
    ]);

    res.json({
      event: {
        id: event.id,
        title: event.title,
        views: event.views
      },
      bookings: bookingStats,
      revenue: {
        total: revenueStats._sum.amount || 0,
        transactions: revenueStats._count
      },
      ticketSales,
      totalAttendees: attendeeStats
    });
  } catch (err) {
    console.error('Get event analytics error:', err);
    next(err);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, eventId } = req.query;

    const where = {
      booking: {
        event: { organizerId: userId },
        ...(eventId && { eventId })
      },
      status: 'SUCCESS',
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [
      totalSales,
      salesByDate,
      topEvents
    ] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        where,
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.payment.groupBy({
        by: ['bookingId'],
        where,
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      summary: {
        totalRevenue: totalSales._sum.amount || 0,
        totalTransactions: totalSales._count
      },
      salesByDate,
      topEvents
    });
  } catch (err) {
    console.error('Get sales report error:', err);
    next(err);
  }
};