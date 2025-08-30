const prisma = require('../db/prisma');

exports.getAllCategories = async (req, res, next) => {
  try {
    const { includeInactive = false } = req.query;
    
    const where = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            events: {
              where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC'
              }
            }
          }
        }
      }
    });

    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            events: {
              where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC'
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.getCategoryEvents = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, sort = 'startAt' } = req.query;

    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const events = await prisma.event.findMany({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        ticketTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        images: {
          where: { isPrimary: true }
        }
      },
      orderBy: { [sort]: 'asc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.event.count({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      }
    });

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
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, color, sortOrder } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
        sortOrder: sortOrder || 0
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, sortOrder } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has events
    const eventCount = await prisma.event.count({
      where: { categoryId: id }
    });

    if (eventCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing events'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive
      }
    });

    res.json({
      message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      category: updatedCategory
    });
  } catch (err) {
    next(err);
  }
};