import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  dailyDigest: boolean("daily_digest").default(false).notNull(),
  systemRole: text("system_role").default("user").notNull(),
});

export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  description: text("description"),
  columnId: text("column_id").notNull(),
  boardId: uuid("board_id").references(() => boards.id),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const boardMembers = pgTable(
  "board_members",
  {
    boardId: uuid("board_id")
      .references(() => boards.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.boardId, t.userId] }),
  }),
);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => users.id)
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),

  commentId: uuid("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  requestId: uuid("request_id").references(() => platformAccessRequests.id, {
    onDelete: "cascade",
  }),
  content: text("content"),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  boardId: uuid("board_id").references(() => boards.id, {
    onDelete: "cascade",
  }),

  type: text("type").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boardInvites = pgTable("board_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  role: text("role").default("member").notNull(),
  inviterId: uuid("inviter_id")
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platformAccessRequests = pgTable("platform_access_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id").references(() => boards.id),
  requesterId: uuid("requester_id").references(() => users.id),
  targetEmail: text("target_email").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  action: text("action").notNull(),
  adminName: text("admin_name").default("Admin").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  // This assumes the adminName matches a user,
  // though storing the string 'adminName' is safer for historical records
  // if a user is deleted.
}));

export const boardsRelations = relations(boards, ({ many, one }) => ({
  tasks: many(tasks),
  members: many(boardMembers),
  owner: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
  invites: many(boardInvites),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(boardMembers),
  tasks: many(tasks),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  board: one(boards, {
    fields: [tasks.boardId],
    references: [boards.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  comments: many(comments),
  attachments: many(attachments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  board: one(boards, {
    fields: [comments.boardId],
    references: [boards.id],
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));
