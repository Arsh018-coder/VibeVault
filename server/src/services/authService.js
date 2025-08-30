const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/environment");

class AuthService {
    static generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN || "7d",
        });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            throw new Error("Invalid token");
        }
    }

    static async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await UserModel.findByEmail(userData.email);
            if (existingUser) {
                throw new Error("User already exists with this email");
            }

            // Create new user
            const user = await UserModel.create(userData);

            // Generate token
            const token = this.generateToken(user.id);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            return {
                user: userWithoutPassword,
                token,
            };
        } catch (err) {
            console.error("Registration failed:", err);
            throw err;
        }
    }

    static async login(email, password) {
        try {
            // Find user by email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new Error("Invalid email or password");
            }

            // Check password
            const isPasswordValid = await UserModel.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }

            // Generate token
            const token = this.generateToken(user.id);

            // Remove password from response
            const { password: userPassword, ...userWithoutPassword } = user;

            return {
                user: userWithoutPassword,
                token,
            };
        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    }

    static async getUserById(userId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (err) {
            console.error("Failed to get user:", err);
            throw err;
        }
    }

    static async updateProfile(userId, updateData) {
        try {
            const user = await UserModel.update(userId, updateData);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (err) {
            console.error("Profile update failed:", err);
            throw err;
        }
    }

    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Verify current password
            const isCurrentPasswordValid = await UserModel.comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error("Current password is incorrect");
            }

            // Update password
            await UserModel.update(userId, { password: newPassword });

            return { message: "Password updated successfully" };
        } catch (err) {
            console.error("Password change failed:", err);
            throw err;
        }
    }

    static async deleteAccount(userId) {
        try {
            await UserModel.delete(userId);
            return { message: "Account deleted successfully" };
        } catch (err) {
            console.error("Account deletion failed:", err);
            throw err;
        }
    }
}

module.exports = AuthService;