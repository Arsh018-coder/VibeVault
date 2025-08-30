const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "organizer", "admin"),
      defaultValue: "user",
    },
    profileImage: {
      type: DataTypes.STRING, // Cloudinary URL
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      // Hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Instance method for password comparison
User.prototype.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Associations
User.associate = (models) => {
  // User can organize many events
  User.hasMany(models.Event, { foreignKey: "organizerId" });

  // User can make many bookings
  User.hasMany(models.Booking, { foreignKey: "userId" });

  // User receives notifications
  User.hasMany(models.Notification, { foreignKey: "userId" });
};

module.exports = User;
