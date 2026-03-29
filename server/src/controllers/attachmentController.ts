import { Response } from "express";
import { S3Service } from "../services/s3Service";
import { db } from "../db";
import { attachments } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../types";
import { catchAsync } from "../utils/catchAsync";
import { signAttachmentUrls } from "../middleware/attachmentMiddleware";

export const getPresignedUrl = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { fileName, fileType } = req.query;

    const imageData = await S3Service.generateUploadUrl(
      fileName as string,
      fileType as string,
    );

    res.json(imageData);
  },
);

export const saveAttachment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const {
      boardId,
      taskId,
      commentId,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      storageKey,
    } = req.body;

    const [newAttachment] = await db
      .insert(attachments)
      .values({
        boardId,
        taskId,
        commentId,
        userId: req.userId!,
        fileName,
        fileUrl,
        storageKey,
        fileType,
        fileSize,
      })
      .returning();

    res.status(201).json(newAttachment);
  },
);

export const getBoardAttachments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const results = await db
      .select()
      .from(attachments)
      .where(eq(attachments.boardId, boardId));

    // Clean and reusable!
    const securedResults = await signAttachmentUrls(results);
    res.json(securedResults);
  },
);

export const getTaskAttachments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const results = await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, taskId));

    const securedResults = await signAttachmentUrls(results);
    res.json(securedResults);
  },
);

export const deleteAttachment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    if (attachment.storageKey) {
      await S3Service.deleteFile(attachment.storageKey);
    }

    await db.delete(attachments).where(eq(attachments.id, id));

    res.status(204).send();
  },
);
