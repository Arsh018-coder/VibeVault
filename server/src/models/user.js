<<<<<<< HEAD
const prisma = require("../db/prisma");
=======
const { DataTypes } = require("sequelize");
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

<<<<<<< HEAD
class UserModel {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async update(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  static async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static async findAll(options = {}) {
    return prisma.user.findMany(options);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
=======
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
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
