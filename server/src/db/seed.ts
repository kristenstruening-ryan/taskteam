import { db } from "./index";
import {
  users,
  boards,
  tasks,
  comments,
  notifications,
  boardMembers,
  boardInvites,
  platformAccessRequests,
  auditLogs,
  attachments,
} from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting Comprehensive Seed...");

  // 1. Clear existing data
  await db.delete(notifications);
  await db.delete(attachments);
  await db.delete(auditLogs);
  await db.delete(platformAccessRequests);
  await db.delete(boardInvites);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(boardMembers);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Create the 3 Demo Users
  const [admin] = await db.insert(users).values({
    name: "System Admin",
    email: "admin@taskteam.com",
    password: hashedPassword,
    systemRole: "admin", // Controls platform-wide access
  }).returning();

  const [owner] = await db.insert(users).values({
    name: "Project Owner",
    email: "owner@example.com",
    password: hashedPassword,
    systemRole: "user",
  }).returning();

  const [member] = await db.insert(users).values({
    name: "Team Member",
    email: "member@example.com",
    password: hashedPassword,
    systemRole: "user",
  }).returning();

  // 3. Create Board (Owned by the 'owner' user)
  const [board] = await db.insert(boards).values({
    title: "Q1 Product Launch",
    userId: owner.id,
  }).returning();

  // 4. Add Board Memberships
  await db.insert(boardMembers).values([
    { boardId: board.id, userId: owner.id, role: "owner" },
    { boardId: board.id, userId: member.id, role: "member" },
    { boardId: board.id, userId: admin.id, role: "admin" },
  ]);

  // 5. Create Task (Assigned to the member)
  const [task] = await db.insert(tasks).values({
    content: "API Authentication Refactor",
    description: "Move to the new modular Drizzle driver system.",
    columnId: "in-progress",
    boardId: board.id,
    userId: owner.id,
    assignedTo: member.id, // Assigned to our member demo user
    order: 0,
  }).returning();

  // 6. Create Comment (From the member)
  const [comment] = await db.insert(comments).values({
    content: "I've uploaded the new schema diagram here.",
    taskId: task.id,
    userId: member.id,
    boardId: board.id,
  }).returning();

  // 7. CREATE ATTACHMENTS
  await db.insert(attachments).values([
    {
      fileName: "Project_Requirements.pdf",
      fileUrl: "https://example.com/project_reqs.pdf",
      storageKey: "seed/project_reqs.pdf",
      fileType: "application/pdf",
      fileSize: 102400,
      boardId: board.id,
      userId: owner.id,
    },
    {
      fileName: "auth-flow.png",
      fileUrl: "https://example.com/auth-flow.png",
      storageKey: "seed/auth-flow.png",
      fileType: "image/png",
      fileSize: 204800,
      boardId: board.id,
      taskId: task.id,
      userId: member.id,
    },
    {
      fileName: "schema-v2.sql",
      fileUrl: "https://example.com/schema-v2.sql",
      storageKey: "seed/schema-v2.sql",
      fileType: "text/plain",
      fileSize: 5000,
      boardId: board.id,
      taskId: task.id,
      commentId: comment.id,
      userId: member.id,
    }
  ]);

  // 8. Historical Audit Log (For Admin testing)
  await db.insert(auditLogs).values({
    email: "former-employee@company.com",
    action: "denied",
    adminName: "System Admin",
    timestamp: new Date(),
  });

  console.log(`
✅ Seed Complete!
🚀 Board Created: "Q1 Product Launch"

Available Logins (Password: password123):
👑 Admin:  admin@taskteam.com
🏠 Owner:  owner@example.com
🛠️ Member: member@example.com
  `);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});