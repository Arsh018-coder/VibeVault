const prisma = require('../db/prisma');

exports.getCategories = async (req, res, next) => {
  try {
    const { includeEventCount = false } = req.query;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      ...(includeEventCount === 'true' && {
        include: {
          _count: {
            select: {
              events: {
                where: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      })
    });

    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    next(err);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        events: {
          where: { status: 'PUBLISHED' },
          include: {
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            ticketTypes: {
              orderBy: { price: 'asc' },
              take: 1
            },
            images: {
              where: { isPrimary: true },
              take: 1
            }
          },
          orderBy: { startAt: 'asc' }
        },
        _count: {
          select: { events: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error('Get category by ID error:', err);
    next(err);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        events: {
          where: { status: 'PUBLISHED' },
          include: {
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            ticketTypes: {
              orderBy: { price: 'asc' },
              take: 1
            },
            images: {
              where: { isPrimary: true },
              take: 1
            }
          },
          orderBy: { startAt: 'asc' }
        },
        _count: {
          select: { events: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error('Get category by slug error:', err);
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, color, sortOrder = 0 } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
        sortOrder,
        isActive: true
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    console.error('Create category error:', err);
    next(err);
  }
};