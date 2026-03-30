import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { MeetingService } from "../services/meetingService";
import { catchAsync } from "../utils/catchAsync";
import { signAttachmentUrls } from "../middleware/attachmentMiddleware";

export const createMeeting = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { title, boardId, startTime, meetingLink, description } = req.body;

    if (!title || !boardId || !startTime) {
      return res.status(400).json({ error: "Missing required meeting fields" });
    }

    const meeting = await MeetingService.createMeeting({
      title,
      boardId,
      startTime,
      meetingLink,
      description,
      createdById: req.userId!,
    });

    res.status(201).json(meeting);
  },
);

export const getBoardMeetings = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const meetingsList = await MeetingService.getBoardMeetings(boardId);

    const meetingsWithSignedFiles = await Promise.all(
      meetingsList.map(async (m: any) => ({
        ...m,
        attachments: m.attachments
          ? await signAttachmentUrls(m.attachments)
          : [],
      })),
    );

    res.json(meetingsWithSignedFiles);
  },
);

export const deleteMeeting = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const deleted = await MeetingService.deleteMeeting(id, req.userId!);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Meeting not found or unauthorized" });
    }

    res.json({ message: "Meeting cancelled successfully" });
  },
);
