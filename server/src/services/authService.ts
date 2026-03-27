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

  generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
  },

  verifyToken(token: string) {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded.userId) throw new Error("Invalid payload");
    return decoded.userId;
  },

  async findUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async findUserById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { password: false }, 
    });
  }
};