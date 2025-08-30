const prisma = require("../db/prisma");
const bcrypt = require("bcryptjs");

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
