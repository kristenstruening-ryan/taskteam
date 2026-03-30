import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UserService {
  static async updateProfile(userId: string, name: string) {
    const [updatedUser] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, name: users.name });
    return updatedUser;
  }

  static async updateNotificationSettings(
    userId: string,
    settings: { emailNotifications: boolean; dailyDigest: boolean }
  ) {
    const [updated] = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning({
        emailNotifications: users.emailNotifications,
        dailyDigest: users.dailyDigest
      });
    return updated;
  }
}