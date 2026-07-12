import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class BankController {
  // GET /api/bank/accounts
  async getBankAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.bankAccount.findMany({
        where: { tenantId: req.tenantId!, deletedAt: null },
        orderBy: { accountName: 'asc' }
      });
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Bank accounts retrieved successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/bank/accounts
  async createBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountName, accountNumber, routingNumber, bankName, balance, currency } = req.body;
      if (!accountName || !accountNumber || !bankName) {
        return next(new BadRequestError('AccountName, AccountNumber, and BankName are required'));
      }

      const account = await prisma.bankAccount.create({
        data: {
          accountName,
          accountNumber,
          routingNumber: routingNumber || null,
          bankName,
          balance: parseFloat(balance || 0),
          currency: currency || 'USD',
          tenantId: req.tenantId!
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Bank account registered successfully',
        data: account
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/bank/accounts/:id/transactions
  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const list = await prisma.bankTransaction.findMany({
        where: { bankAccountId: id, tenantId: req.tenantId! },
        orderBy: { date: 'desc' }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Transactions retrieved successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/bank/accounts/:id/transactions
  async createTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, description, amount, reference } = req.body;

      if (!description || !amount) {
        return next(new BadRequestError('Description and amount are required'));
      }

      const txAmount = parseFloat(amount);

      return prisma.$transaction(async (tx) => {
        const transaction = await tx.bankTransaction.create({
          data: {
            bankAccountId: id,
            date: date ? new Date(date) : new Date(),
            description,
            amount: txAmount,
            reference: reference || null,
            tenantId: req.tenantId!
          }
        });

        // Adjust bank balance
        await tx.bankAccount.update({
          where: { id },
          data: { balance: { increment: txAmount } }
        });

        return sendResponse({
          res,
          statusCode: 201,
          success: true,
          message: 'Bank transaction logged successfully',
          data: transaction
        });
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/bank/accounts/:id/reconcile/:transId
  async reconcileTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { transId } = req.params;

      const tx = await prisma.bankTransaction.update({
        where: { id: transId },
        data: { isReconciled: true }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Transaction marked as reconciled',
        data: tx
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/bank/accounts/:id/statement (Auto Reconciliation Parser)
  async uploadStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { statementText } = req.body;

      if (!statementText) {
        return next(new BadRequestError('Statement paste data is required'));
      }

      const lines = statementText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      const imported: any[] = [];
      let autoReconciledCount = 0;

      await prisma.$transaction(async (tx) => {
        for (const line of lines) {
          const parts = line.split(',');
          if (parts.length < 3) continue; // skip malformed

          const date = new Date(parts[0].trim());
          const description = parts[1].trim();
          const amount = parseFloat(parts[2].trim());
          const reference = parts[3] ? parts[3].trim() : undefined;

          if (isNaN(amount)) continue;

          // Create bank transaction log
          const bankTx = await tx.bankTransaction.create({
            data: {
              bankAccountId: id,
              date,
              description,
              amount,
              reference: reference || null,
              tenantId: req.tenantId!
            }
          });

          // Check if there is an ERP payment matching this amount exactly
          const erpMatch = await tx.payment.findFirst({
            where: {
              amount: Math.abs(amount),
              tenantId: req.tenantId!
            }
          });

          if (erpMatch) {
            // Auto reconcile!
            await tx.bankTransaction.update({
              where: { id: bankTx.id },
              data: { isReconciled: true }
            });
            autoReconciledCount++;
          }

          // Adjust bank balance
          await tx.bankAccount.update({
            where: { id },
            data: { balance: { increment: amount } }
          });

          imported.push(bankTx);
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: `Statement parsed. Imported ${imported.length} transactions, automatically reconciled ${autoReconciledCount} matches.`,
        data: imported
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BankController();
export const bankController = new BankController();
