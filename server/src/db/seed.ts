import { db } from "./index";
import {
  users,
  boards,
  tasks,
  comments,
  notifications,
  boardMembers,
} from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting fresh seed with Guest Accounts and Board Chat...");

  await db.delete(notifications);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(boardMembers);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  const [kristen] = await db
    .insert(users)
    .values({
      name: "Kristen S.",
      email: "kristen@example.com",
      password: hashedPassword,
    })
    .returning();

  const [guestOwner] = await db
    .insert(users)
    .values({
      name: "Guest Owner",
      email: "owner@guest.com",
      password: hashedPassword,
    })
    .returning();

  const [guestTeammate] = await db
    .insert(users)
    .values({
      name: "Guest Teammate",
      email: "team@guest.com",
      password: hashedPassword,
    })
    .returning();

  console.log("👤 Created Kristen, Guest Owner, and Guest Teammate.");

  const [board] = await db
    .insert(boards)
    .values({
      title: "TaskTeam Alpha Launch",
      userId: guestOwner.id,
    })
    .returning();

  await db.insert(boardMembers).values([
    { boardId: board.id, userId: guestOwner.id, role: "owner" },
    { boardId: board.id, userId: guestTeammate.id, role: "member" },
    { boardId: board.id, userId: kristen.id, role: "member" },
  ]);

  const [task1, task2, task3, task4] = await db
    .insert(tasks)
    .values([
      {
        content: "Finalize Prisma Schema",
        description:
          "Ensure all relations are mapped for comments and notifications.",
        columnId: "done",
        boardId: board.id,
        userId: guestOwner.id,
        assignedTo: guestOwner.id,
        dueDate: new Date("2026-03-01"),
        order: 0,
      },
      {
        content: "Design Task Sidebar",
        description: "Needs to support description editing and comment feed.",
        columnId: "in-progress",
        boardId: board.id,
        userId: guestOwner.id,
        assignedTo: guestTeammate.id,
        dueDate: new Date("2026-03-25"),
        order: 0,
      },
      {
        content: "Implement Board Chat UI",
        description: "Add a side panel for general team discussions.",
        columnId: "todo",
        boardId: board.id,
        userId: guestOwner.id,
        assignedTo: kristen.id,
        dueDate: new Date("2026-04-15"),
        order: 0,
      },
      {
        content: "Bug: Sidebar scroll jump",
        description: "Sidebar jumps to top when adding a new comment.",
        columnId: "todo",
        boardId: board.id,
        userId: guestOwner.id,
        assignedTo: guestTeammate.id,
        order: 1,
      },
    ])
    .returning();

  const [comment1] = await db
    .insert(comments)
    .values([
      {
        boardId: board.id,
        taskId: task2.id,
        userId: guestTeammate.id,
        content:
          "Just updated the CSS for the sidebar, @owner@guest.com check it out!",
      },
      {
        boardId: board.id,
        taskId: null,
        userId: guestOwner.id,
        content:
          "Welcome to the project everyone! Use this space for general updates.",
      },
      {
        boardId: board.id,
        taskId: null,
        userId: kristen.id,
        content:
          "Excited to get started on the Chat UI. I'll post wireframes here later.",
      },
    ])
    .returning();

  await db.insert(notifications).values([
    {
      recipientId: guestOwner.id,
      senderId: guestTeammate.id,
      commentId: comment1.id,
      type: "mention",
      isRead: false,
    },
  ]);

  console.log(`
✅ Seeding complete!
🔑 Guest Owner: owner@guest.com / password123
🔑 Guest Teammate: team@guest.com / password123
🚀 Board: "${board.title}" is ready for demo.
  `);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
