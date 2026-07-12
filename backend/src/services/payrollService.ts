import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class PayrollService {
  // Process monthly payroll for all active employees
  async processPayroll(tenantId: string, month: number, year: number, adminUserId?: string) {
    // Check if payroll already run for this period
    const existingRun = await prisma.payrollRun.findFirst({
      where: { month, year, tenantId, deletedAt: null }
    });
    if (existingRun && existingRun.status === 'PAID') {
      throw new BadRequestError(`Payroll for period ${month}/${year} has already been paid and finalized`);
    }

    // Fetch active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE', tenantId, deletedAt: null },
      include: { salaryStructure: true }
    });

    if (employees.length === 0) {
      throw new BadRequestError('No active employees found to process payroll');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Delete draft run if it exists to allow re-runs
      if (existingRun && existingRun.status === 'DRAFT') {
        await tx.payslip.deleteMany({ where: { payrollRunId: existingRun.id } });
        await tx.payrollRun.delete({ where: { id: existingRun.id } });
      }

      // 2. Create a Payroll Run entry in DRAFT status
      const run = await tx.payrollRun.create({
        data: {
          month,
          year,
          status: 'DRAFT',
          processedAt: new Date(),
          tenantId,
        }
      });

      // 3. Compute salary details
      for (const emp of employees) {
        // Base monthly salary computation
        const monthlyBase = emp.salary;

        // Structured breakdown components
        const basic = emp.salaryStructure?.basicSalary || (monthlyBase * 0.5);
        const allowances = emp.salaryStructure?.allowances || (monthlyBase * 0.2);
        const gross = basic + allowances;
        
        const bonus = emp.salaryStructure?.bonus || (monthlyBase * 0.1);
        const incentives = emp.salaryStructure?.incentives || (monthlyBase * 0.2);

        // Deductions
        const tax = emp.salaryStructure?.tax || (gross * 0.1);
        const pf = emp.salaryStructure?.pf || (basic * 0.08);
        const professionalTax = emp.salaryStructure?.professionalTax || (basic * 0.02);
        
        const deductions = tax + pf + professionalTax;
        const net = (gross + bonus + incentives) - deductions;

        await tx.payslip.create({
          data: {
            employeeId: emp.id,
            payrollRunId: run.id,
            basicSalary: basic,
            allowances,
            grossSalary: gross,
            bonus,
            incentives,
            tax,
            pf,
            professionalTax,
            deductions,
            netSalary: net,
            status: 'UNPAID',
            tenantId,
          }
        });
      }

      // Log Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'PROCESS_PAYROLL',
          module: 'PAYROLL',
          details: `Processed draft payroll runs for period ${month}/${year} (${employees.length} employees)`,
          tenantId,
        }
      });

      return run;
    });
  }

  // Finalize / Approve payroll run (Change DRAFT -> PAID)
  async approvePayroll(tenantId: string, runId: string, adminUserId?: string) {
    const run = await prisma.payrollRun.findFirst({
      where: { id: runId, tenantId, deletedAt: null }
    });

    if (!run) {
      throw new NotFoundError('Payroll run record not found');
    }

    if (run.status === 'PAID') {
      throw new BadRequestError('Payroll run has already been approved and paid.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update status
      const updatedRun = await tx.payrollRun.update({
        where: { id: runId },
        data: { status: 'PAID' }
      });

      // 2. Update all associated payslips
      await tx.payslip.updateMany({
        where: { payrollRunId: runId },
        data: { status: 'PAID', paymentDate: new Date() }
      });

      // 3. Double Entry Accounting Mappings (Optional Integration)
      const cashAccount = await tx.account.findFirst({
        where: { code: '1010', tenantId, deletedAt: null } // standard cash code
      });
      const expenseAccount = await tx.account.findFirst({
        where: { code: '5010', tenantId, deletedAt: null } // standard payroll expense code
      });

      if (cashAccount && expenseAccount) {
        // Calculate total net payouts
        const totalNetAggregate = await tx.payslip.aggregate({
          _sum: { netSalary: true },
          where: { payrollRunId: runId }
        });
        const totalNet = totalNetAggregate._sum.netSalary || 0;

        // Create General Ledger Transaction
        const transaction = await tx.transaction.create({
          data: {
            reference: `PAY-${run.month}-${run.year}-${Date.now().toString().slice(-4)}`,
            description: `Salary disbursement for period ${run.month}/${run.year}`,
            date: new Date(),
            status: 'POSTED',
            createdById: adminUserId || 'system',
            tenantId
          }
        });

        // Debit Expense Account
        await tx.transactionLine.create({
          data: {
            transactionId: transaction.id,
            accountId: expenseAccount.id,
            debit: totalNet,
            credit: 0,
            tenantId
          }
        });

        // Credit Cash Account
        await tx.transactionLine.create({
          data: {
            transactionId: transaction.id,
            accountId: cashAccount.id,
            debit: 0,
            credit: totalNet,
            tenantId
          }
        });

        // Update Account Balances
        await tx.account.update({
          where: { id: expenseAccount.id },
          data: { balance: { increment: totalNet } }
        });

        await tx.account.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: totalNet } }
        });
      }

      // Log Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'APPROVE_PAYROLL',
          module: 'PAYROLL',
          details: `Approved and disbursed salaries for run period: ${run.month}/${run.year}`,
          tenantId
        }
      });

      return updatedRun;
    });
  }

  // Get payslips for a given period
  async getPayslips(tenantId: string, month: number, year: number) {
    return prisma.payslip.findMany({
      where: {
        tenantId,
        deletedAt: null,
        payrollRun: {
          month,
          year,
          deletedAt: null,
        }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            designation: true
          }
        }
      }
    });
  }

  // Get payslips history (Approved list)
  async getPayrollHistory(tenantId: string) {
    return prisma.payrollRun.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { processedAt: 'desc' },
      include: {
        _count: {
          select: { payslips: true }
        }
      }
    });
  }
}

export default new PayrollService();
export const payrollService = new PayrollService();
