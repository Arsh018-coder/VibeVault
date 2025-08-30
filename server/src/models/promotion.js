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
