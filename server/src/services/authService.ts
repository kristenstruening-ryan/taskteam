import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const AuthService = {
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  },

  async comparePasswords(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  },

  generateToken(userId: string, systemRole: string, email: string, name: string) {
    return jwt.sign({ userId, systemRole, email, name }, JWT_SECRET, {
      expiresIn: "24h",
    });
  },

  verifyToken(token: string): {
    userId: string;
    systemRole: string;
    email: string;
    name: string;
  } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        systemRole: string;
        email: string;
        name: string;
      };

      if (!decoded.userId || !decoded.systemRole || !decoded.email || !decoded.name) {
        throw new Error("Invalid token payload: Missing required fields");
      }

      return decoded;
    } catch (error) {
      console.error("JWT Error:", error);
      throw new Error("Token verification failed");
    }
  },

  async findUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async findUserById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        createdAt: true,
      },
    });
  },
};
