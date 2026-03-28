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
  auditLogs, // 1. Import the new table
} from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting Comprehensive Seed...");

  // 2. Clear existing data (added auditLogs to the top of the delete chain)
  await db.delete(notifications);
  await db.delete(auditLogs); // Clear logs
  await db.delete(platformAccessRequests);
  await db.delete(boardInvites);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(boardMembers);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Users
  const [admin] = await db.insert(users).values({
    name: "System Admin",
    email: "admin@taskteam.com",
    password: hashedPassword,
    systemRole: "admin",
  }).returning();

  const [kristen] = await db.insert(users).values({
    name: "Kristen S.",
    email: "kristen@example.com",
    password: hashedPassword,
    systemRole: "user",
  }).returning();

  const [lead] = await db.insert(users).values({
    name: "Project Lead",
    email: "owner@guest.com",
    password: hashedPassword,
    systemRole: "user",
  }).returning();

  // 4. Create Board
  const [board] = await db.insert(boards).values({
    title: "Q1 Product Launch",
    userId: lead.id,
  }).returning();

  // 5. Add Members
  await db.insert(boardMembers).values([
    { boardId: board.id, userId: lead.id, role: "owner" },
    { boardId: board.id, userId: kristen.id, role: "member" },
    { boardId: board.id, userId: admin.id, role: "member" },
  ]);

  // 6. Create Tasks
  const [task2] = await db.insert(tasks).values({
    content: "API Authentication Refactor",
    description: "Move to the new modular Drizzle driver system.",
    columnId: "in-progress",
    boardId: board.id,
    userId: kristen.id,
    assignedTo: kristen.id,
    order: 0,
  }).returning();

  // 7. Create Comments
  await db.insert(comments).values([
    {
      content: "Refactoring the schema to use Drizzle instead of Prisma!",
      taskId: task2.id,
      userId: kristen.id,
      boardId: board.id,
    }
  ]);

  // 8. Access Requests
  const [request] = await db.insert(platformAccessRequests).values({
    boardId: board.id,
    requesterId: lead.id,
    targetEmail: "new-hire@company.com",
    status: "pending",
  }).returning();

  // 9. NEW: Add some historical Audit Logs
  await db.insert(auditLogs).values([
    {
      email: "previous-intern@company.com",
      action: "denied",
      adminName: "System Admin",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      email: "senior-dev@company.com",
      action: "approved",
      adminName: "System Admin",
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    }
  ]);

  await db.insert(notifications).values({
    recipientId: admin.id,
    senderId: lead.id,
    requestId: request.id,
    type: "access_request",
    content: `Project Lead requested platform access for new-hire@company.com`,
  });

  console.log(`
✅ Seed Complete!
🚀 Board Created: "Q1 Product Launch"
🔑 Admin: admin@taskteam.com / password123
📜 Audit Logs Generated: 2
  `);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});