
import { db } from "./index";
import { users, boards, tasks } from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.delete(tasks);
  await db.delete(boards);
  await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);
  const [user] = await db
    .insert(users)
    .values({
      email: "test@example.com",
      password: hashedPassword,
    })
    .returning();

  console.log(`👤 Created user: ${user.email}`);

  const [board] = await db
    .insert(boards)
    .values({
      title: "Project Alpha",
      userId: user.id,
    })
    .returning();

  console.log(`📋 Created board: ${board.title}`);

  await db.insert(tasks).values([
    {
      content: "Setup Next.js Frontend",
      columnId: "done",
      boardId: board.id,
      userId: user.id,
      order: 0,
    },
    {
      content: "Implement Drag and Drop",
      columnId: "todo",
      boardId: board.id,
      userId: user.id,
      order: 0,
    },
    {
      content: "Connect Socket.io for teams",
      columnId: "todo",
      boardId: board.id,
      userId: user.id,
      order: 1,
    },
  ]);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
