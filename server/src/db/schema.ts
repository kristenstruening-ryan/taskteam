import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// --- TABLES ---

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

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  meetingLink: text("meeting_link"),
  description: text("description"),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phases = pgTable("phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'active', 'completed'
  dueDate: timestamp("due_date"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  description: text("description"),
  columnId: text("column_id").notNull(),
  boardId: uuid("board_id").references(() => boards.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  phaseId: uuid("phase_id").references(() => phases.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  meetingId: uuid("meeting_id").references(() => meetings.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  visibility: text("visibility").default("public").notNull(),
  recipientId: uuid("recipient_id").references(() => users.id),
  isEdited: boolean("is_edited").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  meetingId: uuid("meeting_id").references(() => meetings.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  storageKey: text("storage_key"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => users.id)
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),
  boardId: uuid("board_id").references(() => boards.id, {
    onDelete: "cascade",
  }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  meetingId: uuid("meeting_id").references(() => meetings.id, {
    onDelete: "cascade",
  }),
  requestId: uuid("request_id").references(() => platformAccessRequests.id, {
    onDelete: "cascade",
  }),
  content: text("content"),
  type: text("type").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  action: text("action").notNull(),
  adminName: text("admin_name").default("Admin").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  tasks: many(tasks),
  assignedTasks: many(tasks, { relationName: "assignedTo" }),
  boardMemberships: many(boardMembers),
  comments: many(comments),
  attachments: many(attachments),
}));

export const meetingsRelations = relations(meetings, ({ many, one }) => ({
  board: one(boards, { fields: [meetings.boardId], references: [boards.id] }),
  creator: one(users, {
    fields: [meetings.createdById],
    references: [users.id],
  }),
  comments: many(comments),
  attachments: many(attachments),
}));

export const boardsRelations = relations(boards, ({ many, one }) => ({
  tasks: many(tasks),
  members: many(boardMembers),
  attachments: many(attachments),
  meetings: many(meetings),
  owner: one(users, { fields: [boards.userId], references: [users.id] }),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  board: one(boards, { fields: [phases.boardId], references: [boards.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  board: one(boards, { fields: [tasks.boardId], references: [boards.id] }),
  phase: one(phases, { fields: [tasks.phaseId], references: [phases.id] }),
  comments: many(comments),
  attachments: many(attachments),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  meeting: one(meetings, {
    fields: [comments.meetingId],
    references: [meetings.id],
  }),
  recipient: one(users, {
    fields: [comments.recipientId],
    references: [users.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, { fields: [attachments.taskId], references: [tasks.id] }),
  board: one(boards, {
    fields: [attachments.boardId],
    references: [boards.id],
  }),
  comment: one(comments, {
    fields: [attachments.commentId],
    references: [comments.id],
  }),
  meeting: one(meetings, {
    fields: [attachments.meetingId],
    references: [meetings.id],
  }),
  user: one(users, { fields: [attachments.userId], references: [users.id] }),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(users, { fields: [boardMembers.userId], references: [users.id] }),
}));
