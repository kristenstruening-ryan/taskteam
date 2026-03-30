import { db } from "../db";
import { tasks, phases } from "../db/schema";
import { eq, and, sql, asc } from "drizzle-orm";

export class ProjectBoardService {
  static async getProjectMetrics(boardId: string) {
    const allTasks = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(*) filter (where column_id = 'done')`,
      })
      .from(tasks)
      .where(eq(tasks.boardId, boardId));

    const globalStats = allTasks[0];
    const globalVelocity =
      globalStats.total > 0
        ? Math.round((globalStats.completed / globalStats.total) * 100)
        : 0;

    const activePhase = await db.query.phases.findFirst({
      where: and(eq(phases.boardId, boardId), eq(phases.status, "active")),
      with: { tasks: true },
    });

    let health = "Standby";
    let phaseProgress = 0;

    if (activePhase) {
      const totalInPhase = activePhase.tasks.length;
      if (totalInPhase > 0) {
        const completedInPhase = activePhase.tasks.filter(
          (t) => t.columnId === "done",
        ).length;
        phaseProgress = Math.round((completedInPhase / totalInPhase) * 100);
      }

      const now = new Date();
      const isOverdue =
        activePhase.dueDate && new Date(activePhase.dueDate) < now;

      if (isOverdue && phaseProgress < 100) {
        health = "At Risk";
      } else if (phaseProgress === 100) {
        health = "Phase Complete";
      } else if (phaseProgress > 0) {
        health = "Healthy";
      } else {
        health = "Initialising";
      }
    }

    return {
      globalVelocity,
      currentPhase: activePhase
        ? {
            title: activePhase.title,
            progress: phaseProgress,
            status: health,
            dueDate: activePhase.dueDate,
          }
        : null,
      totalTasks: globalStats.total,
    };
  }

  static async getPhasesWithProgress(boardId: string) {
    return await db.query.phases.findMany({
      where: eq(phases.boardId, boardId),
      orderBy: [asc(phases.order)],
      with: {
        tasks: {
          columns: {
            columnId: true,
          },
        },
      },
    });
  }
}
