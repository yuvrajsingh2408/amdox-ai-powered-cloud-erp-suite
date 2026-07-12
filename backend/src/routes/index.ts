import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import hrRoutes from './hrRoutes';
import payrollRoutes from './payrollRoutes';
import financeRoutes from './financeRoutes';
import apRoutes from './apRoutes';
import arRoutes from './arRoutes';
import bankRoutes from './bankRoutes';
import scmRoutes from './scmRoutes';
import inventoryRoutes from './inventoryRoutes';
import forecastingRoutes from './forecastingRoutes';
import projectRoutes from './projectRoutes';
import notificationRoutes from './notificationRoutes';
import tenantRoutes from './tenantRoutes';
import rbacRoutes from './rbacRoutes';
import departmentRoutes from './departmentRoutes';
import auditRoutes from './auditRoutes';
import orgRoutes from './orgRoutes';
import biRoutes from './biRoutes';
import crmRoutes from './crmRoutes';
import documentRoutes from './documentRoutes';
import aiRoutes from './aiRoutes';
import reportRoutes from './reportRoutes';
import analyticsRoutes from './analyticsRoutes';
import workflowRoutes from './workflowRoutes';
import approvalRoutes from './approvalRoutes';
import portalRoutes from './portalRoutes';
import securityRoutes from './securityRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Amdox ERP API Server is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hr', hrRoutes);
router.use('/payroll', payrollRoutes);
router.use('/finance', financeRoutes);
router.use('/ap', apRoutes);
router.use('/ar', arRoutes);
router.use('/bank', bankRoutes);
router.use('/scm', scmRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/forecasting', forecastingRoutes);
router.use('/projects', projectRoutes);
router.use('/notifications', notificationRoutes);
router.use('/tenants', tenantRoutes);
router.use('/rbac', rbacRoutes);
router.use('/departments', departmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/org', orgRoutes);
router.use('/bi', biRoutes);
router.use('/crm', crmRoutes);
router.use('/documents', documentRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/workflows', workflowRoutes);
router.use('/approvals', approvalRoutes);
router.use('/portals', portalRoutes);
router.use('/security', securityRoutes);
router.use('/admin', adminRoutes);

export default router;
export { router };
