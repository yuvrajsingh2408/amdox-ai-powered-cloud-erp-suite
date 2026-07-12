/**
 * Workflow Engine Unit Tests
 *
 * Tests workflow state machine logic, step transitions, and approval routing.
 */

// ─── Workflow State Machine ────────────────────────────────────────────────
type WorkflowStatus = 'DRAFT' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

const VALID_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  DRAFT:     ['PENDING', 'CANCELLED'],
  PENDING:   ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'REJECTED', 'PENDING'],
  APPROVED:  [],
  REJECTED:  ['DRAFT'],
  CANCELLED: [],
};

const canTransition = (from: WorkflowStatus, to: WorkflowStatus): boolean =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false;

describe('Workflow — State Machine Transitions', () => {
  it('allows DRAFT → PENDING', () => {
    expect(canTransition('DRAFT', 'PENDING')).toBe(true);
  });

  it('allows PENDING → IN_REVIEW', () => {
    expect(canTransition('PENDING', 'IN_REVIEW')).toBe(true);
  });

  it('allows IN_REVIEW → APPROVED', () => {
    expect(canTransition('IN_REVIEW', 'APPROVED')).toBe(true);
  });

  it('allows IN_REVIEW → REJECTED', () => {
    expect(canTransition('IN_REVIEW', 'REJECTED')).toBe(true);
  });

  it('allows REJECTED → DRAFT (resubmit)', () => {
    expect(canTransition('REJECTED', 'DRAFT')).toBe(true);
  });

  it('denies APPROVED → PENDING (immutable approval)', () => {
    expect(canTransition('APPROVED', 'PENDING')).toBe(false);
  });

  it('denies CANCELLED → APPROVED', () => {
    expect(canTransition('CANCELLED', 'APPROVED')).toBe(false);
  });

  it('denies DRAFT → APPROVED (must go through review)', () => {
    expect(canTransition('DRAFT', 'APPROVED')).toBe(false);
  });
});

describe('Workflow — Approval Step Logic', () => {
  interface ApprovalStep {
    stepOrder: number;
    approverRole: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approverId?: string;
    approvedAt?: Date;
  }

  const getNextStep = (steps: ApprovalStep[]): ApprovalStep | null => {
    return steps.find(s => s.status === 'PENDING') ?? null;
  };

  const allApproved = (steps: ApprovalStep[]): boolean =>
    steps.every(s => s.status === 'APPROVED');

  it('returns first pending step', () => {
    const steps: ApprovalStep[] = [
      { stepOrder: 1, approverRole: 'MANAGER', status: 'APPROVED' },
      { stepOrder: 2, approverRole: 'FINANCE', status: 'PENDING' },
      { stepOrder: 3, approverRole: 'CEO', status: 'PENDING' },
    ];
    const next = getNextStep(steps);
    expect(next?.stepOrder).toBe(2);
    expect(next?.approverRole).toBe('FINANCE');
  });

  it('returns null when all steps are approved', () => {
    const steps: ApprovalStep[] = [
      { stepOrder: 1, approverRole: 'MANAGER', status: 'APPROVED' },
      { stepOrder: 2, approverRole: 'FINANCE', status: 'APPROVED' },
    ];
    expect(getNextStep(steps)).toBeNull();
    expect(allApproved(steps)).toBe(true);
  });

  it('correctly identifies incomplete approvals', () => {
    const steps: ApprovalStep[] = [
      { stepOrder: 1, approverRole: 'MANAGER', status: 'APPROVED' },
      { stepOrder: 2, approverRole: 'FINANCE', status: 'PENDING' },
    ];
    expect(allApproved(steps)).toBe(false);
  });
});

describe('Workflow — Escalation Logic', () => {
  const isOverdue = (createdAt: Date, slaHours: number): boolean => {
    const elapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return elapsed > slaHours;
  };

  it('detects overdue workflow (past SLA)', () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    expect(isOverdue(old, 24)).toBe(true);
  });

  it('does not flag workflow within SLA', () => {
    const recent = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    expect(isOverdue(recent, 24)).toBe(false);
  });
});
