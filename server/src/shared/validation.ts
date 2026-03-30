import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title exceeds maximum length"),

  boardId: z.uuid("Invalid board coordinate"),

  startTime: z.string().refine(
    (date) => {
      const scheduledDate = new Date(date);
      return !isNaN(scheduledDate.getTime()) && scheduledDate > new Date();
    },
    {
      message: "Meeting must be scheduled for a future timestamp",
    },
  ),

  meetingLink: z.url("Invalid link format").optional().or(z.literal("")),

  description: z.string().max(500).optional(),
});
