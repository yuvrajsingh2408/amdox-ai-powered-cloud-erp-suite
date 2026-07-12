import { EventEmitter } from 'events';
import logger from '../utils/logger';

/**
 * Custom Enterprise Event Emitter to support Event-Driven Architecture.
 * Allows decoupling of major business subsystems (e.g. Finance automatically posting a Journal Entry when SCM completes a Purchase Order).
 */
class ErpEventEmitter extends EventEmitter {}

export const erpEmitter = new ErpEventEmitter();

// Register global ERP system event listeners
erpEmitter.on('inventory.low', (data: { sku: string; name: string; quantity: number }) => {
  logger.warn(`[EVENT] ⚠️ Inventory Low warning: SKU ${data.sku} (${data.name}) only has ${data.quantity} units remaining.`);
});

erpEmitter.on('payroll.processed', (data: { month: number; year: number; processedBy: string }) => {
  logger.info(`[EVENT] ✨ Payroll Run completed successfully for month ${data.month}/${data.year} by User: ${data.processedBy}`);
});

erpEmitter.on('invoice.paid', (data: { invoiceNumber: string; amount: number; tenantId: string }) => {
  logger.info(`[EVENT] 💳 Payment received for Invoice ${data.invoiceNumber}. Amount: $${data.amount}. Tenant: ${data.tenantId}`);
});

export default erpEmitter;
