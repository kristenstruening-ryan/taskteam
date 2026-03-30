import { db } from "../db";
import { phases, tasks } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";

export class PhaseService {
  static async getBoardPhases(boardId: string) {
    return await db.query.phases.findMany({
      where: eq(phases.boardId, boardId),
      orderBy: (phases, { asc }) => [asc(phases.order)],
      with: {
        tasks: {
          columns: {
            columnId: true,
          },
        },
      },
    });
  }

  static async createPhase(data: {
    boardId: string;
    title: string;
    order: number;
    dueDate?: string;
  }) {
    const [newPhase] = await db
      .insert(phases)
      .values({
        boardId: data.boardId,
        title: data.title,
        order: data.order,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: "pending",
      })
      .returning();
    return newPhase;
  }

  static async updatePhase(
    id: string,
    updates: Partial<{ title: string; status: string; order: number }>,
  ) {
    const [updated] = await db
      .update(phases)
      .set(updates)
      .where(eq(phases.id, id))
      .returning();
    return updated;
  }

  static async deletePhase(id: string) {
    return await db.delete(phases).where(eq(phases.id, id)).returning();
  }
  static async completeAndTransition(currentPhaseId: string, boardId: string) {
    return await db.transaction(async (tx) => {
      await tx
        .update(tasks)
        .set({ columnId: "done" })
        .where(eq(tasks.phaseId, currentPhaseId));

      await tx
        .update(phases)
        .set({ status: "completed" })
        .where(eq(phases.id, currentPhaseId));

      const nextPhase = await tx.query.phases.findFirst({
        where: and(eq(phases.boardId, boardId), eq(phases.status, "pending")),
        orderBy: [asc(phases.order)],
      });

      if (nextPhase) {
        await tx
          .update(phases)
          .set({ status: "active" })
          .where(eq(phases.id, nextPhase.id));
      }

      return { nextPhaseId: nextPhase?.id || null };
    });
  }
}
