import prisma from '../config/db';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface WorkflowStepInput {
  name: string;
  stepOrder: number;
  approverType: string;  // "ROLE", "USER", "MANAGER"
  approverValue: string; // e.g. "FINANCE_MANAGER"
  conditionType?: string; // "AMOUNT_GREATER_THAN", "DEPARTMENT_MATCH", "NONE"
  conditionValue?: string;
  slaHours?: number;
}

export class WorkflowService {
  // ----------------------------------------------------
  // 1. Workflow Definitions CRUD
  // ----------------------------------------------------
  async getWorkflows(tenantId: string, search?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (search) {
      where.name = { contains: search };
    }
    return prisma.workflow.findMany({
      where,
      include: { steps: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWorkflow(
    tenantId: string,
    userId: string,
    data: { name: string; description?: string; triggerType: string; steps: WorkflowStepInput[] }
  ) {
    if (!data.name || !data.triggerType || !data.steps || data.steps.length === 0) {
      throw new BadRequestError('Name, triggerType, and steps are required fields');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const wf = await tx.workflow.create({
          data: {
            tenantId,
            name: data.name,
            description: data.description || null,
            triggerType: data.triggerType.toUpperCase(),
            isActive: true,
            version: 1,
            createdBy: userId,
          },
        });

        const steps = data.steps.map((s) => ({
          workflowId: wf.id,
          name: s.name,
          stepOrder: s.stepOrder,
          approverType: s.approverType.toUpperCase(),
          approverValue: s.approverValue,
          conditionType: s.conditionType || null,
          conditionValue: s.conditionValue || null,
          slaHours: s.slaHours || null,
        }));

        await tx.workflowStep.createMany({ data: steps });

        return tx.workflow.findUnique({
          where: { id: wf.id },
          include: { steps: true },
        });
      });
    } catch (error: any) {
      logger.error(`[Workflow Service] Failed to create workflow: ${error.message}`);
      throw error;
    }
  }

  async updateWorkflow(
    tenantId: string,
    id: string,
    userId: string,
    data: { name: string; description?: string; steps: WorkflowStepInput[] }
  ) {
    const wf = await prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!wf) throw new NotFoundError('Workflow not found');

    try {
      return await prisma.$transaction(async (tx) => {
        // Increment version on update
        await tx.workflow.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description || null,
            version: wf.version + 1,
            updatedBy: userId,
          },
        });

        // Recreate steps
        await tx.workflowStep.deleteMany({ where: { workflowId: id } });

        const steps = data.steps.map((s) => ({
          workflowId: id,
          name: s.name,
          stepOrder: s.stepOrder,
          approverType: s.approverType.toUpperCase(),
          approverValue: s.approverValue,
          conditionType: s.conditionType || null,
          conditionValue: s.conditionValue || null,
          slaHours: s.slaHours || null,
        }));

        await tx.workflowStep.createMany({ data: steps });

        return tx.workflow.findUnique({
          where: { id },
          include: { steps: true },
        });
      });
    } catch (error: any) {
      logger.error(`[Workflow Service] Update workflow failed: ${error.message}`);
      throw error;
    }
  }

  async toggleWorkflowActive(tenantId: string, id: string) {
    const wf = await prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!wf) throw new NotFoundError('Workflow definition not found');

    return prisma.workflow.update({
      where: { id },
      data: { isActive: !wf.isActive },
    });
  }

  async deleteWorkflow(tenantId: string, id: string) {
    const wf = await prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!wf) throw new NotFoundError('Workflow definition not found');

    return prisma.workflow.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async duplicateWorkflow(tenantId: string, id: string, userId: string) {
    const wf = await prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { steps: true },
    });

    if (!wf) throw new NotFoundError('Workflow design not found');

    return prisma.$transaction(async (tx) => {
      const clone = await tx.workflow.create({
        data: {
          tenantId,
          name: `${wf.name} (Copy)`,
          description: wf.description,
          triggerType: wf.triggerType,
          isActive: true,
          version: 1,
          createdBy: userId,
        },
      });

      const cloneSteps = wf.steps.map((s) => ({
        workflowId: clone.id,
        name: s.name,
        stepOrder: s.stepOrder,
        approverType: s.approverType,
        approverValue: s.approverValue,
        conditionType: s.conditionType,
        conditionValue: s.conditionValue,
        slaHours: s.slaHours,
      }));

      await tx.workflowStep.createMany({ data: cloneSteps });

      return tx.workflow.findUnique({
        where: { id: clone.id },
        include: { steps: true },
      });
    });
  }

  // ----------------------------------------------------
  // 2. Predefined Workflow Templates Seeding
  // ----------------------------------------------------
  async getWorkflowTemplates(tenantId: string) {
    const count = await prisma.workflowTemplate.count({
      where: { OR: [{ tenantId: null }, { tenantId }] },
    });

    if (count === 0) {
      const defaultTemplates = [
        {
          name: 'Corporate Leave Approval Route',
          triggerType: 'LEAVE',
          description: 'Two-stage route: Supervisor manager verification followed by final HR manager clearance.',
          stepsJson: JSON.stringify([
            { name: 'Supervisor Review', stepOrder: 1, approverType: 'MANAGER', approverValue: 'SUPERVISOR', slaHours: 24 },
            { name: 'HR Clearance', stepOrder: 2, approverType: 'ROLE', approverValue: 'HR_MANAGER', slaHours: 48 },
          ]),
        },
        {
          name: 'Purchase Order Capital Sign-Off',
          triggerType: 'PURCHASE_ORDER',
          description: 'Approval based on expense limits: Finance controller clearance followed by CFO check for high values.',
          stepsJson: JSON.stringify([
            { name: 'SCM Audit', stepOrder: 1, approverType: 'ROLE', approverValue: 'SCM_MANAGER', slaHours: 24 },
            { name: 'Finance Controller sign-off', stepOrder: 2, approverType: 'ROLE', approverValue: 'FINANCE_MANAGER', conditionType: 'AMOUNT_GREATER_THAN', conditionValue: '5000', slaHours: 48 },
          ]),
        },
      ];

      for (const t of defaultTemplates) {
        await prisma.workflowTemplate.create({ data: t });
      }
    }

    return prisma.workflowTemplate.findMany({
      where: { OR: [{ tenantId: null }, { tenantId }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 3. Workflow Execution Track Logs
  // ----------------------------------------------------
  async getWorkflowInstances(tenantId: string, status?: string) {
    const whereClause: any = { tenantId, deletedAt: null };
    if (status) {
      whereClause.status = status;
    }
    return prisma.workflowInstance.findMany({
      where: whereClause,
      include: {
        workflow: true,
        approvals: {
          include: { approverUser: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new WorkflowService();
export const workflowService = new WorkflowService();
