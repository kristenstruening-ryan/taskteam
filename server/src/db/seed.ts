import { db } from "./index";
import {
  users,
  boards,
  tasks,
  phases,
  comments,
  notifications,
  boardMembers,
  boardInvites,
  platformAccessRequests,
  auditLogs,
  attachments,
  meetings,
} from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting Comprehensive Seed v3 (Phases & Velocity)...");

  // 1. Clear existing data - Cascading order is vital
  await db.delete(notifications);
  await db.delete(attachments);
  await db.delete(auditLogs);
  await db.delete(platformAccessRequests);
  await db.delete(boardInvites);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(meetings);
  await db.delete(phases);
  await db.delete(boardMembers);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Create the 3 Demo Users
  const [admin] = await db.insert(users).values({
    name: "System Admin",
    email: "admin@taskteam.com",
    password: hashedPassword,
    systemRole: "admin",
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

  // 3. Create Board
  const [board] = await db.insert(boards).values({
    title: "Q1 Product Launch",
    userId: owner.id,
  }).returning();

  // 4. Create Phases (The roadmap for Project Pulse)
  const [phase1] = await db.insert(phases).values({
    title: "Phase 01: Core Infrastructure",
    boardId: board.id,
    status: "active",
    order: 1,
  }).returning();

  const [phase2] = await db.insert(phases).values({
    title: "Phase 02: UI Deployment",
    boardId: board.id,
    status: "pending",
    order: 2,
  }).returning();

  // 5. Add Board Memberships
  await db.insert(boardMembers).values([
    { boardId: board.id, userId: owner.id, role: "owner" },
    { boardId: board.id, userId: member.id, role: "member" },
    { boardId: board.id, userId: admin.id, role: "admin" },
  ]);

  // 6. Create Tasks (Setting up the 75% Progress Ratio)
  const taskData = [
    {
      content: "Database Schema Migrations",
      columnId: "done", // Completed
      boardId: board.id,
      userId: owner.id,
      phaseId: phase1.id,
      order: 1,
    },
    {
      content: "API Authentication Refactor",
      description: "Move to the new modular Drizzle driver system.",
      columnId: "done", // Completed
      boardId: board.id,
      userId: owner.id,
      assignedTo: member.id,
      phaseId: phase1.id,
      order: 2,
    },
    {
      content: "WebSocket Gateway Integration",
      columnId: "done", // Completed
      boardId: board.id,
      userId: owner.id,
      phaseId: phase1.id,
      order: 3,
    },
    {
      content: "Frontend Dashboard Layout",
      columnId: "in-progress", // Not done -> Result: 3/4 = 75%
      boardId: board.id,
      userId: owner.id,
      phaseId: phase1.id,
      order: 4,
    }
  ];

  const seededTasks = await db.insert(tasks).values(taskData).returning();
  const mainTask = seededTasks[1]; // Use the "Auth Refactor" task for comments

  // 7. Create a Meeting
  const [meeting] = await db.insert(meetings).values({
    title: "Project Kickoff Sync",
    description: "Discussing the Q1 roadmap and resourcing.",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
    meetingLink: "https://meet.google.com/abc-defg-hij",
    boardId: board.id,
    createdById: owner.id,
  }).returning();

  // 8. Create Comments
  await db.insert(comments).values([
    {
      content: "I've uploaded the new schema diagram here.",
      taskId: mainTask.id,
      userId: member.id,
      boardId: board.id,
      visibility: "public",
    },
    {
      content: "Hey Owner, I'm a bit stuck on the JWT middleware, can we chat privately?",
      userId: member.id,
      boardId: board.id,
      visibility: "private",
      recipientId: owner.id,
    },
    {
      content: "I'll be 5 minutes late to the kickoff!",
      meetingId: meeting.id,
      userId: member.id,
      boardId: board.id,
      visibility: "public",
    }
  ]);

  // 9. Create Attachments
  await db.insert(attachments).values([
    {
      fileName: "Meeting_Agenda.docx",
      fileUrl: "https://example.com/agenda.docx",
      storageKey: "seed/agenda.docx",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 45000,
      boardId: board.id,
      meetingId: meeting.id,
      userId: owner.id,
    },
    {
      fileName: "auth-flow.png",
      fileUrl: "https://example.com/auth-flow.png",
      storageKey: "seed/auth-flow.png",
      fileType: "image/png",
      fileSize: 204800,
      boardId: board.id,
      taskId: mainTask.id,
      userId: member.id,
    }
  ]);

  // 10. Audit Log
  await db.insert(auditLogs).values({
    email: "former-employee@company.com",
    action: "denied",
    adminName: "System Admin",
    timestamp: new Date(),
  });

  console.log(`
✅ Seed Complete v3!
🚀 Board Created: "Q1 Product Launch"
🏗️ Phase 01 Active: 75% Velocity (3/4 Tasks Complete)
📅 Meeting Created: "Project Kickoff Sync"
🔒 Private Messaging initialized.

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