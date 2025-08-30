<<<<<<< HEAD
const prisma = require("../db/prisma");

class PromotionModel {
  static async create(promotionData) {
    return prisma.promotion.create({
      data: promotionData,
      include: {
        event: true,
      },
    });
  }

  static async findById(id) {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });
  }

  static async findByCode(code) {
    return prisma.promotion.findUnique({
      where: { code },
      include: {
        event: true,
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.promotion.findMany({
      ...options,
      include: {
        event: true,
        ...options.include,
      },
    });
  }

  static async update(id, promotionData) {
    return prisma.promotion.update({
      where: { id },
      data: promotionData,
      include: {
        event: true,
      },
    });
  }

  static async delete(id) {
    return prisma.promotion.delete({
      where: { id },
    });
  }

  static async findByEvent(eventId) {
    return prisma.promotion.findMany({
      where: { eventId },
      include: {
        event: true,
      },
    });
  }

  static async validatePromotion(code, eventId = null) {
    const promotion = await prisma.promotion.findUnique({
      where: { code },
    });

    if (!promotion) return { valid: false, message: "Invalid promotion code" };

    const now = new Date();
    if (now < promotion.validFrom || now > promotion.validUntil) {
      return { valid: false, message: "Promotion code has expired" };
    }

    if (promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, message: "Promotion code usage limit reached" };
    }

    if (eventId && promotion.eventId && promotion.eventId !== eventId) {
      return { valid: false, message: "Promotion code not valid for this event" };
    }

    return { valid: true, promotion };
  }

  static async incrementUsage(id) {
    return prisma.promotion.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  static async getActivePromotions(eventId = null) {
    const now = new Date();
    const where = {
      validFrom: { lte: now },
      validUntil: { gte: now },
      usedCount: { lt: prisma.promotion.fields.usageLimit },
    };

    if (eventId) {
      where.OR = [
        { eventId },
        { eventId: null }, // Global promotions
      ];
    }

    return prisma.promotion.findMany({
      where,
      include: {
        event: true,
      },
    });
  }
}

module.exports = PromotionModel;
=======
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Promotion = sequelize.define(
  "Promotion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: DataTypes.ENUM("percentage", "flat"),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Associations
Promotion.associate = (models) => {
  // A promotion may apply to an event
  Promotion.belongsTo(models.Event, { foreignKey: "eventId" });
};

module.exports = Promotion;
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
