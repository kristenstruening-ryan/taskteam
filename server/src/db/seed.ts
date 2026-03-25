import { db } from "./index";
import { users, boards, tasks, comments, notifications } from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database with collaborative data...");

  await db.delete(notifications);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  const [kristen] = await db
    .insert(users)
    .values({
      email: "kristen@example.com",
      password: hashedPassword,
    })
    .returning();

  const [teammate] = await db
    .insert(users)
    .values({
      email: "teammate@example.com",
      password: hashedPassword,
    })
    .returning();

  console.log(`👤 Created users: ${kristen.email}, ${teammate.email}`);

  const [board] = await db
    .insert(boards)
    .values({
      title: "Project Alpha",
      userId: kristen.id,
    })
    .returning();

  const [task1, task2, task3] = await db
    .insert(tasks)
    .values([
      {
        content: "Setup Next.js Frontend",
        description: "Initialize Next.js with Tailwind CSS.",
        columnId: "done",
        boardId: board.id,
        userId: kristen.id,
        assignedTo: kristen.id,
        order: 0,
      },
      {
        content: "Implement Drag and Drop",
        description: "Use @hello-pangea/dnd to allow users to move cards.",
        columnId: "in-progress",
        boardId: board.id,
        userId: kristen.id,
        assignedTo: kristen.id,
        order: 0,
      },
      {
        content: "Connect Socket.io for teams",
        description: "Enable real-time updates.",
        columnId: "todo",
        boardId: board.id,
        userId: kristen.id,
        assignedTo: teammate.id,
        order: 1,
      },
    ])
    .returning();

  const [comment1] = await db
    .insert(comments)
    .values([
      {
        taskId: task3.id,
        userId: teammate.id,
        content: "Hey @kristen@example.com, starting on Socket.io!",
      },
    ])
    .returning();

  await db.insert(notifications).values([
    {
      recipientId: kristen.id,
      senderId: teammate.id,
      commentId: comment1.id,
      type: "mention",
      isRead: false,
    },
  ]);

  console.log("✅ Seeding complete! Try logging in with kristen@example.com");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
