import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = (token: string): string => {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  if (!decoded.userId) throw new Error("Invalid token payload");
  return decoded.userId;
};