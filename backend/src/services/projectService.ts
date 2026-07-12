import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class ProjectService {
  // --- Project CRUD ---
  async getProjects(tenantId: string) {
    return prisma.project.findMany({
      where: { tenantId, deletedAt: null },
      include: { client: true, tasks: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProjectDetails(projectId: string, tenantId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId, deletedAt: null },
      include: {
        client: true,
        tasks: {
          where: { deletedAt: null },
          include: { assignee: true, sprint: true }
        },
        milestones: { where: { deletedAt: null } },
        sprints: { where: { deletedAt: null } },
        allocations: {
          where: { deletedAt: null },
          include: { employee: true }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // AI Completion Delay & Budget Overrun Prediction Calculations
    const totalTasksCount = project.tasks.length;
    const completedTasksCount = project.tasks.filter(t => t.status === 'DONE').length;
    const delayedTasksCount = project.tasks.filter(t => t.status !== 'DONE' && t.endDate && new Date(t.endDate) < new Date()).length;
    
    // Delay Risk Ratio: delayed tasks out of uncompleted ones
    const delayRiskScore = totalTasksCount > 0
      ? Math.round((delayedTasksCount / totalTasksCount) * 100)
      : 12;

    // Budget Overrun Ratio: actual cost compared to budget limit
    const budgetOverrunScore = project.budget > 0
      ? Math.round((project.actualCost / project.budget) * 100)
      : 0;

    const budgetOverrunRisk = budgetOverrunScore > 90 ? 'HIGH' : budgetOverrunScore > 60 ? 'MEDIUM' : 'LOW';

    return {
      ...project,
      progressPercent: totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0,
      aiPredictions: {
        delayRiskPercent: delayRiskScore,
        budgetOverrunRisk,
        budgetUsagePercent: budgetOverrunScore,
        estimatedDelayDays: delayedTasksCount * 4
      }
    };
  }

  async createProject(tenantId: string, data: any) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'PLANNING',
        budget: parseFloat(data.budget) || 0.0,
        clientId: data.clientId || null,
        tenantId
      }
    });
  }

  // --- Task CRUD & Interactive Items ---
  async getTaskDetails(taskId: string, tenantId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, tenantId, deletedAt: null },
      include: {
        assignee: true,
        comments: {
          where: { deletedAt: null },
          include: { user: true }
        },
        attachments: { where: { deletedAt: null } },
        activities: { where: { deletedAt: null } }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async createTask(tenantId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: data.projectId,
          name: data.name,
          description: data.description,
          status: data.status || 'TODO',
          priority: data.priority || 'MEDIUM',
          assigneeId: data.assigneeId || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          sprintId: data.sprintId || null,
          tenantId
        }
      });

      await tx.taskActivity.create({
        data: {
          taskId: task.id,
          action: 'Task created',
          performedById: data.performedById || 'system',
          tenantId
        }
      });

      return task;
    });
  }

  async updateTaskStatus(taskId: string, tenantId: string, status: string, performedById: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: { status }
      });

      await tx.taskActivity.create({
        data: {
          taskId,
          action: `Status changed to ${status}`,
          performedById,
          tenantId
        }
      });

      return updated;
    });
  }

  async addTaskComment(tenantId: string, taskId: string, userId: string, commentText: string) {
    return prisma.taskComment.create({
      data: {
        taskId,
        userId,
        comment: commentText,
        tenantId
      },
      include: { user: true }
    });
  }

  // --- Sprints & Milestones ---
  async createSprint(tenantId: string, data: any) {
    return prisma.sprint.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'PLANNING',
        tenantId
      }
    });
  }

  async createMilestone(tenantId: string, data: any) {
    return prisma.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        dueDate: new Date(data.dueDate),
        status: data.status || 'PENDING',
        tenantId
      }
    });
  }
}

export default new ProjectService();
export const projectService = new ProjectService();
