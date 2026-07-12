import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class FinanceService {
  // Check if a date falls into a locked financial period
  async isPeriodLocked(tenantId: string, date: Date): Promise<boolean> {
    const lockedPeriod = await prisma.financialPeriod.findFirst({
      where: {
        tenantId,
        startDate: { lte: date },
        endDate: { gte: date },
        isLocked: true,
        deletedAt: null,
      },
    });
    return !!lockedPeriod;
  }

  // Post manual journal transaction (Double-Entry Debit/Credit checks)
  async postJournalEntry(
    tenantId: string,
    data: {
      description: string;
      lines: { accountId: string; debit: number; credit: number }[];
    },
    adminUserId?: string
  ) {
    if (data.lines.length < 2) {
      throw new BadRequestError('A journal entry must contain at least two transaction lines');
    }

    // Verify date is not locked
    const today = new Date();
    const isLocked = await this.isPeriodLocked(tenantId, today);
    if (isLocked) {
      throw new BadRequestError('Cannot post transaction: Financial period is locked.');
    }

    // Sum validation
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of data.lines) {
      if (line.debit < 0 || line.credit < 0) {
        throw new BadRequestError('Debit and credit values must be non-negative');
      }
      if (line.debit > 0 && line.credit > 0) {
        throw new BadRequestError('A single transaction line cannot have both debit and credit values');
      }
      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    // Verify total debits = total credits
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestError(`Transaction debits ($${totalDebit}) must exactly equal credits ($${totalCredit})`);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create Transaction Header
      const transaction = await tx.transaction.create({
        data: {
          reference: `JE-${Date.now()}`,
          description: data.description,
          date: today,
          status: 'POSTED',
          createdById: adminUserId || 'system',
          tenantId,
        },
      });

      // 2. Create Transaction Lines & update balances
      for (const line of data.lines) {
        // Fetch account
        const account = await tx.account.findFirst({
          where: { id: line.accountId, tenantId, deletedAt: null }
        });
        if (!account) {
          throw new NotFoundError(`General Ledger Account not found: ${line.accountId}`);
        }

        // Create line
        await tx.transactionLine.create({
          data: {
            transactionId: transaction.id,
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            tenantId,
          },
        });

        // Compute balance adjustments (Asset/Expense increases on debit, others increase on credit)
        let adjustment = 0;
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          adjustment = line.debit - line.credit;
        } else {
          adjustment = line.credit - line.debit;
        }

        await tx.account.update({
          where: { id: line.accountId },
          data: { balance: { increment: adjustment } },
        });
      }

      // Log Audit
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          tenantId,
          action: 'POST_JOURNAL_ENTRY',
          module: 'FINANCE',
          details: `Posted double-entry journal: ${data.description}. Total amount: $${totalDebit}`,
        },
      });

      return transaction;
    });
  }

  // Create Invoice (AP & AR)
  async createInvoice(
    tenantId: string,
    data: {
      invoiceNumber: string;
      type: string;
      vendorId?: string;
      customerId?: string;
      amount: number;
      tax?: number;
      dueDate: string;
      issuedDate: string;
    },
    adminUserId?: string
  ) {
    const existing = await prisma.invoice.findFirst({
      where: { invoiceNumber: data.invoiceNumber, tenantId, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestError('Invoice number already exists');
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        type: data.type,
        vendorId: data.vendorId || null,
        customerId: data.customerId || null,
        amount: data.amount,
        tax: data.tax || 0,
        dueDate: new Date(data.dueDate),
        issuedDate: new Date(data.issuedDate),
        status: 'DRAFT',
        tenantId,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        tenantId,
        action: 'CREATE_INVOICE',
        module: 'FINANCE',
        details: `Created invoice: ${invoice.invoiceNumber} (${invoice.type}) - Amount: $${invoice.amount}`,
      },
    });

    return invoice;
  }

  // Financial Reports Engine: Profit and Loss
  async getProfitAndLoss(tenantId: string) {
    const revenueAccounts = await prisma.account.findMany({
      where: { tenantId, type: 'REVENUE', deletedAt: null }
    });
    const expenseAccounts = await prisma.account.findMany({
      where: { tenantId, type: 'EXPENSE', deletedAt: null }
    });

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      revenueAccounts: revenueAccounts.map(a => ({ name: a.name, code: a.code, balance: a.balance })),
      expenseAccounts: expenseAccounts.map(a => ({ name: a.name, code: a.code, balance: a.balance })),
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    };
  }

  // Financial Reports Engine: Balance Sheet
  async getBalanceSheet(tenantId: string) {
    const assets = await prisma.account.findMany({
      where: { tenantId, type: 'ASSET', deletedAt: null }
    });
    const liabilities = await prisma.account.findMany({
      where: { tenantId, type: 'LIABILITY', deletedAt: null }
    });
    const equity = await prisma.account.findMany({
      where: { tenantId, type: 'EQUITY', deletedAt: null }
    });

    // Automatically incorporate dynamic Retained Earnings from P&L Net Income
    const pl = await this.getProfitAndLoss(tenantId);
    
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0) + pl.netIncome;

    return {
      assets: assets.map(a => ({ name: a.name, code: a.code, balance: a.balance })),
      liabilities: liabilities.map(a => ({ name: a.name, code: a.code, balance: a.balance })),
      equity: [
        ...equity.map(a => ({ name: a.name, code: a.code, balance: a.balance })),
        { name: 'Retained Earnings (Current Period Net Income)', code: '3900', balance: pl.netIncome }
      ],
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
  }

  // Financial Reports Engine: Trial Balance
  async getTrialBalance(tenantId: string) {
    const accounts = await prisma.account.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { code: 'asc' }
    });

    let totalDebits = 0;
    let totalCredits = 0;

    const rows = accounts.map(a => {
      let debit = 0;
      let credit = 0;

      if (a.type === 'ASSET' || a.type === 'EXPENSE') {
        if (a.balance >= 0) {
          debit = a.balance;
        } else {
          credit = Math.abs(a.balance);
        }
      } else {
        if (a.balance >= 0) {
          credit = a.balance;
        } else {
          debit = Math.abs(a.balance);
        }
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        code: a.code,
        name: a.name,
        type: a.type,
        debit,
        credit
      };
    });

    return {
      rows,
      totalDebits,
      totalCredits
    };
  }
}

export default new FinanceService();
export const financeService = new FinanceService();
