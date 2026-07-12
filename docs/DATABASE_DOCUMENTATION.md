# Database Documentation — Amdox ERP

## Overview

Amdox ERP uses **PostgreSQL 16** with **Prisma ORM** as the database layer.

- **Schema file**: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)
- **Multi-tenancy**: Row-level isolation via `tenantId` column on all business entities
- **Migrations**: Managed by Prisma Migrate (`npx prisma migrate deploy`)
- **ID strategy**: UUID (`@default(uuid())`) for all primary keys
- **Soft deletes**: `deletedAt DateTime?` on entities that support recovery

---

## Standard Fields (All Models)

```prisma
model ExampleModel {
  id        String    @id @default(uuid())
  tenantId  String                          // Required: tenant isolation
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?                       // Soft delete (optional)
  createdBy String?                         // Audit: creator user ID
  updatedBy String?                         // Audit: last modifier user ID
}
```

---

## Module Database Overview

### 1. Core / Auth

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| `Tenant` | Organisation / company | → Users, all business data |
| `User` | System users with login | → Tenant, Employee (optional) |
| `Role` | RBAC roles | → Users |
| `Permission` | Granular permissions | → Roles |
| `RefreshToken` | JWT refresh tracking | → User |
| `AuditLog` | Full action audit trail | → User, Tenant |
| `Session` | Active user sessions | → User |
| `LoginHistory` | Login attempt log | → User |

### 2. HR & Payroll

| Model | Purpose |
|-------|---------|
| `Employee` | Employee profile, personal & job info |
| `Department` | Organisational unit |
| `Attendance` | Clock-in/clock-out records |
| `LeaveRequest` | Leave applications with status |
| `LeaveType` | Configurable leave categories |
| `LeaveBalance` | Per-employee remaining entitlements |
| `Payroll` | Payroll run header |
| `Payslip` | Individual employee payslip |
| `SalaryStructure` | Configurable salary components |

### 3. Finance & Accounting

| Model | Purpose |
|-------|---------|
| `Account` | Chart of accounts |
| `JournalEntry` | Double-entry bookkeeping entries |
| `JournalLine` | Individual debit/credit lines |
| `Invoice` | Accounts receivable |
| `Bill` | Accounts payable |
| `Payment` | Payment records (AR/AP) |
| `BankAccount` | Bank account registry |
| `BankTransaction` | Bank statement entries |
| `Currency` | Multi-currency support |
| `ExchangeRate` | Daily exchange rates |

### 4. Supply Chain & Inventory

| Model | Purpose |
|-------|---------|
| `Vendor` | Supplier registry |
| `Product` | Product/SKU catalog |
| `InventoryItem` | Stock levels per warehouse |
| `Warehouse` | Storage locations |
| `PurchaseRequisition` | Internal purchase requests |
| `PurchaseOrder` | Formal PO to vendor |
| `PurchaseOrderLine` | Line items on PO |
| `GoodsReceipt` | Received goods record |
| `StockMovement` | Inventory movement log |

### 5. CRM

| Model | Purpose |
|-------|---------|
| `Lead` | Potential customers |
| `Client` | Confirmed customers |
| `Opportunity` | Sales pipeline items |
| `Activity` | Calls, emails, meetings |
| `Contact` | Client contact persons |

### 6. Project Management

| Model | Purpose |
|-------|---------|
| `Project` | Project header |
| `Task` | Project task with status |
| `Milestone` | Project milestones |
| `Timesheet` | Time logged per task |
| `ProjectMember` | Team assignments |

### 7. Document Management

| Model | Purpose |
|-------|---------|
| `Document` | File metadata |
| `Folder` | Directory structure |
| `DocumentVersion` | Version history |
| `DocumentShare` | Sharing permissions |

### 8. Workflow Automation

| Model | Purpose |
|-------|---------|
| `WorkflowTemplate` | Reusable workflow definitions |
| `WorkflowStep` | Individual approval steps |
| `WorkflowInstance` | Running workflow instances |
| `ApprovalRecord` | Per-step approval decisions |

### 9. Reports & Analytics

| Model | Purpose |
|-------|---------|
| `Report` | Saved report configurations |
| `ReportTemplate` | System report templates |
| `ScheduledReport` | Automated report schedule |
| `ExportHistory` | Export audit trail |
| `AnalyticsSnapshot` | Point-in-time metric snapshots |

### 10. Notifications

| Model | Purpose |
|-------|---------|
| `Notification` | System notifications |
| `NotificationTemplate` | Email/push templates |
| `NotificationPreference` | User notification settings |

---

## Database Commands

```bash
# Generate Prisma client after schema changes
cd backend && npx prisma generate

# Apply schema to development database
cd backend && npx prisma db push

# Create and apply a migration
cd backend && npx prisma migrate dev --name "add_feature_x"

# Apply migrations in production
cd backend && npx prisma migrate deploy

# Open database browser
cd backend && npx prisma studio

# Reset database (DEV ONLY — DESTROYS ALL DATA)
cd backend && npx prisma migrate reset
```

---

## Indexing Strategy

Key indexes for performance:

```prisma
// Always index tenantId on every major entity
@@index([tenantId])
@@index([tenantId, createdAt])

// Additional indexes per model
// Employee
@@index([tenantId, departmentId])
@@index([tenantId, employeeCode])

// Invoice
@@index([tenantId, status])
@@index([tenantId, dueDate])

// PurchaseOrder
@@index([tenantId, vendorId, status])
```

---

## Connection Configuration

```env
# Development
DATABASE_URL=postgresql://postgres:password@localhost:5432/amdox_erp?schema=public

# Docker
DATABASE_URL=postgresql://postgres:password@db:5432/amdox_erp?schema=public

# Production (with connection pooling via PgBouncer recommended)
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/amdox_erp?schema=public&connection_limit=20
```

---

## Backup Strategy

```bash
# Full backup
pg_dump -U postgres amdox_erp | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup.sql.gz | psql -U postgres amdox_erp

# Point-in-time recovery: Enable WAL archiving in postgresql.conf
# archive_mode = on
# archive_command = 'cp %p /backups/wal/%f'
```
