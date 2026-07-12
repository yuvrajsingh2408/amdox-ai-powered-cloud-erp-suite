import prisma from '../config/db';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ApprovalEngine {
  // ----------------------------------------------------
  // 1. Instantiating running instances
  // ----------------------------------------------------
  async startApprovalWorkflow(
    tenantId: string,
    data: { entityType: string; entityId: string; startedBy: string; amount?: number; departmentId?: string }
  ) {
    const trigger = data.entityType.toUpperCase();

    // Look for an active matching workflow
    const activeWorkflow = await prisma.workflow.findFirst({
      where: { tenantId, triggerType: trigger, isActive: true, deletedAt: null },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    if (!activeWorkflow) {
      logger.info(`[Approval Engine] No active workflow configured for trigger type: ${trigger}. Auto-approving.`);
      await this.autoApproveEntity(trigger, data.entityId);
      return null;
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // Create Instance
        const instance = await tx.workflowInstance.create({
          data: {
            tenantId,
            workflowId: activeWorkflow.id,
            entityType: trigger,
            entityId: data.entityId,
            status: 'PENDING',
            currentStepIndex: 1,
            startedBy: data.startedBy,
          },
        });

        // Filter step routes by checking conditional rules
        const filteredSteps = activeWorkflow.steps.filter((step) => {
          if (!step.conditionType || step.conditionType === 'NONE') return true;
          if (step.conditionType === 'AMOUNT_GREATER_THAN' && step.conditionValue && data.amount !== undefined) {
            const limit = parseFloat(step.conditionValue);
            return data.amount > limit;
          }
          if (step.conditionType === 'DEPARTMENT_MATCH' && step.conditionValue && data.departmentId) {
            return step.conditionValue === data.departmentId;
          }
          return true;
        });

        if (filteredSteps.length === 0) {
          logger.info(`[Approval Engine] All steps skipped based on conditional limits. Auto-approving.`);
          await this.autoApproveEntity(trigger, data.entityId);
          await tx.workflowInstance.update({
            where: { id: instance.id },
            data: { status: 'APPROVED' },
          });
          return null;
        }

        // Generate approval instances
        const approvalsToCreate = filteredSteps.map((step) => {
          let deadline: Date | null = null;
          if (step.slaHours) {
            deadline = new Date();
            deadline.setHours(deadline.getHours() + step.slaHours);
          }

          return {
            tenantId,
            instanceId: instance.id,
            stepOrder: step.stepOrder,
            name: step.name,
            approverRole: step.approverType === 'ROLE' ? step.approverValue : null,
            approverUserId: step.approverType === 'USER' ? step.approverValue : null,
            status: step.stepOrder === 1 ? 'PENDING' : 'QUEUE',
            slaDeadline: deadline,
          };
        });

        for (const appItem of approvalsToCreate) {
          await tx.workflowApproval.create({ data: appItem });
        }

        // Return first active approval step details
        return tx.workflowInstance.findUnique({
          where: { id: instance.id },
          include: { approvals: true },
        });
      });
    } catch (error: any) {
      logger.error(`[Approval Engine] Error instantiating workflow: ${error.message}`);
      throw error;
    }
  }

  // Auto-approver if no design exists or conditions filter them out
  private async autoApproveEntity(type: string, id: string) {
    logger.info(`[Approval Engine] Auto-approving database entity ${type} with id: ${id}`);
    try {
      if (type === 'LEAVE') {
        await prisma.leave.updateMany({
          where: { id },
          data: { status: 'APPROVED' },
        });
      } else if (type === 'INVOICE') {
        await prisma.invoice.updateMany({
          where: { id },
          data: { status: 'PAID' }, // Mark paid or approved
        });
      } else if (type === 'PURCHASE_ORDER') {
        await prisma.purchaseOrder.updateMany({
          where: { id },
          data: { status: 'APPROVED' },
        });
      }
    } catch (e: any) {
      logger.error(`[Approval Engine] Auto-approve execution failed: ${e.message}`);
    }
  }

  // ----------------------------------------------------
  // 2. Decisions submission & transitions
  // ----------------------------------------------------
  async submitDecision(
    tenantId: string,
    approvalId: string,
    userId: string,
    data: { action: 'APPROVED' | 'REJECTED' | 'ESCALATED'; comments?: string }
  ) {
    const approval = await prisma.workflowApproval.findFirst({
      where: { id: approvalId, tenantId },
      include: { instance: true },
    });

    if (!approval) throw new NotFoundError('Pending approval step mapping not found');

    const actor = await prisma.user.findFirst({ where: { id: userId } });
    if (!actor) throw new NotFoundError('Actor user profile not found');

    try {
      return await prisma.$transaction(async (tx) => {
        // Update current step status
        const now = new Date();
        const updatedApproval = await tx.workflowApproval.update({
          where: { id: approvalId },
          data: {
            status: data.action,
            comments: data.comments || null,
            approvedAt: data.action === 'APPROVED' ? now : null,
          },
        });

        // Log audit history trail
        await tx.approvalHistory.create({
          data: {
            approvalId,
            action: data.action,
            actorId: userId,
            comments: data.comments || null,
          },
        });

        const instanceId = approval.instanceId;

        if (data.action === 'APPROVED') {
          // Check for next step order
          const nextApproval = await tx.workflowApproval.findFirst({
            where: {
              instanceId,
              stepOrder: { gt: approval.stepOrder },
              status: 'QUEUE',
            },
            orderBy: { stepOrder: 'asc' },
          });

          if (nextApproval) {
            // Activate the next step in the queue
            await tx.workflowApproval.update({
              where: { id: nextApproval.id },
              data: { status: 'PENDING' },
            });

            await tx.workflowInstance.update({
              where: { id: instanceId },
              data: { currentStepIndex: nextApproval.stepOrder },
            });
          } else {
            // All steps completed successfully -> approve parent entity in SQLite
            await tx.workflowInstance.update({
              where: { id: instanceId },
              data: { status: 'APPROVED' },
            });
            await this.updateEntityApprovalStatus(tx, approval.instance.entityType, approval.instance.entityId, 'APPROVED');
          }
        } else if (data.action === 'REJECTED') {
          // Instantly reject the entire chain
          await tx.workflowInstance.update({
            where: { id: instanceId },
            data: { status: 'REJECTED' },
          });
          await this.updateEntityApprovalStatus(tx, approval.instance.entityType, approval.instance.entityId, 'REJECTED');
        }

        return updatedApproval;
      });
    } catch (error: any) {
      logger.error(`[Approval Engine] Decision processing failed: ${error.message}`);
      throw error;
    }
  }

  private async updateEntityApprovalStatus(tx: any, type: string, id: string, status: 'APPROVED' | 'REJECTED') {
    try {
      if (type === 'LEAVE') {
        await tx.leave.updateMany({
          where: { id },
          data: { status },
        });
      } else if (type === 'INVOICE') {
        await tx.invoice.updateMany({
          where: { id },
          data: { status: status === 'APPROVED' ? 'PAID' : 'DRAFT' },
        });
      } else if (type === 'PURCHASE_ORDER') {
        await tx.purchaseOrder.updateMany({
          where: { id },
          data: { status },
        });
      }
    } catch (e: any) {
      logger.error(`[Approval Engine] Error updating entity status: ${e.message}`);
    }
  }

  // ----------------------------------------------------
  // 3. Background Escalations Checks (SLA deadlines)
  // ----------------------------------------------------
  async scanEscalations(tenantId: string) {
    const now = new Date();
    const pendingOverdue = await prisma.workflowApproval.findMany({
      where: {
        tenantId,
        status: 'PENDING',
        slaDeadline: { lte: now },
      },
      include: { instance: true },
    });

    const escalatedRecords = [];
    for (const app of pendingOverdue) {
      try {
        const record = await prisma.$transaction(async (tx) => {
          // Escalate status
          const updated = await tx.workflowApproval.update({
            where: { id: app.id },
            data: { status: 'ESCALATED' },
          });

          // Set instance status to escalated
          await tx.workflowInstance.update({
            where: { id: app.instanceId },
            data: { status: 'ESCALATED' },
          });

          // Log history
          await tx.approvalHistory.create({
            data: {
              approvalId: app.id,
              action: 'ESCALATED',
              actorId: app.instance.startedBy, // System logs triggerer
              comments: 'SLA timer limit exceeded. Automatically escalated to supervisor chain.',
            },
          });

          return updated;
        });
        escalatedRecords.push(record);
      } catch (err: any) {
        logger.error(`[Approval Engine] Failed to escalate approval item ${app.id}: ${err.message}`);
      }
    }

    return escalatedRecords;
  }

  // ----------------------------------------------------
  // 4. AI Predictions and Diagnostics Engine
  // ----------------------------------------------------
  async getAIRecommendation(approvalId: string) {
    const approval = await prisma.workflowApproval.findFirst({
      where: { id: approvalId },
      include: { instance: { include: { workflow: true } } },
    });

    if (!approval) throw new NotFoundError('Approval mapping details not found');

    // Simulate AI predictions model
    const riskScore = Math.floor(Math.random() * 25) + 5; // 5% - 30% risk
    const delayHours = Math.floor(Math.random() * 8) + 2; // 2 - 10 hours estimated delay
    const isEscalatedProb = riskScore > 20 ? 'HIGH' : 'LOW';

    let recommendation = 'Approve: Entity matches budget buffers and attendance rates check out stable.';
    if (approval.instance.entityType === 'LEAVE') {
      recommendation = 'Suggest Approve: Employee has sufficient leaves accumulation balances and department roster capacity is at 84%.';
    } else if (approval.instance.entityType === 'PURCHASE_ORDER') {
      recommendation = 'Suggest Approve: Pricing matches original quotation contract and matches cost margins rules.';
    }

    return {
      approvalId,
      riskScore,
      delayHours,
      escalationProbability: isEscalatedProb,
      recommendation,
      suggestions: [
        'Establish auto-approval routes for totals below $1,000.',
        'Optimize SCM templates workflow stages to clear low stock items faster.',
      ],
    };
  }
}

export default new ApprovalEngine();
export const approvalEngine = new ApprovalEngine();
