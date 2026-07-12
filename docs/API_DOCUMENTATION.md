# API Documentation — Amdox ERP

## Overview

**Base URL**: `https://api.yourdomain.com/api`  
**Version**: v1 (`/api/v1`)  
**Auth**: Bearer JWT in `Authorization` header  
**Interactive Docs**: `/api-docs` (Swagger UI, available in non-production or when `ENABLE_SWAGGER=true`)

---

## Authentication

### Headers Required on Protected Endpoints

```http
Authorization: Bearer <access_token>
x-tenant-id: <tenant-uuid>
Content-Type: application/json
```

### Login

```http
POST /api/auth/login

Request:
{
  "email": "admin@company.com",
  "password": "YourPassword123!"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "ADMIN",
      "tenantId": "uuid",
      "tenantName": "Acme Corp"
    }
  }
}

Response 401:
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "statusCode": 401
}
```

### Refresh Token

```http
POST /api/auth/refresh

Request:
{ "refreshToken": "eyJhbGci..." }

Response 200:
{ "success": true, "data": { "token": "eyJhbGci..." } }
```

---

## Standard Response Format

All endpoints return:

```json
{
  "success": true | false,
  "message": "Human readable message",
  "data": { ... } | [] | null,
  "statusCode": 200
}
```

## Pagination

List endpoints accept:
```
?page=1&limit=20&sort=createdAt&order=desc&search=keyword
```

Response includes:
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Modules

### 👥 HR & Employee Management

```
GET    /api/hr/employees               List employees
POST   /api/hr/employees               Create employee
GET    /api/hr/employees/:id           Get employee
PUT    /api/hr/employees/:id           Update employee
DELETE /api/hr/employees/:id           Soft delete
GET    /api/hr/employees/:id/payslips  Employee payslips

GET    /api/hr/attendance              List attendance
POST   /api/hr/attendance/clock-in     Clock in
POST   /api/hr/attendance/clock-out    Clock out

GET    /api/hr/leaves                  List leave requests
POST   /api/hr/leaves                  Submit leave request
PATCH  /api/hr/leaves/:id/approve      Approve leave
PATCH  /api/hr/leaves/:id/reject       Reject leave

GET    /api/hr/departments             List departments
POST   /api/hr/departments             Create department
```

**Create Employee Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "departmentId": "uuid",
  "designation": "Senior Developer",
  "dateOfJoining": "2026-01-15",
  "employeeType": "FULL_TIME",
  "baseSalary": 75000
}
```

---

### 💰 Finance & Accounting

```
GET    /api/finance/accounts           Chart of accounts
POST   /api/finance/accounts           Create account
GET    /api/finance/journals           Journal entries
POST   /api/finance/journals           Create journal entry
GET    /api/finance/invoices           AR invoices
POST   /api/finance/invoices           Create invoice
PATCH  /api/finance/invoices/:id/pay   Record payment
GET    /api/finance/bills              AP bills
POST   /api/finance/bills              Record bill
GET    /api/finance/bank-accounts      Bank accounts
GET    /api/finance/reports/pl         Profit & Loss
GET    /api/finance/reports/bs         Balance Sheet
GET    /api/finance/reports/cf         Cash Flow
```

**P&L Report Query:**
```
GET /api/finance/reports/pl?from=2026-01-01&to=2026-12-31&currency=USD
```

---

### 📦 Supply Chain & Inventory

```
GET    /api/scm/vendors                List vendors
POST   /api/scm/vendors                Create vendor
GET    /api/scm/products               Product catalog
GET    /api/scm/inventory              Stock levels
POST   /api/scm/inventory/adjust       Stock adjustment
GET    /api/scm/purchase-orders        List POs
POST   /api/scm/purchase-orders        Create PO
PATCH  /api/scm/purchase-orders/:id/approve  Approve PO
POST   /api/scm/goods-receipts         Record GRN
GET    /api/scm/warehouses             Warehouse list
```

---

### 🤖 AI Copilot

```
POST   /api/ai/query                   Natural language query
GET    /api/ai/insights                AI insights
GET    /api/ai/recommendations         AI recommendations
POST   /api/ai/conversations           Start conversation
GET    /api/ai/conversations/:id/messages  Chat history
GET    /api/ai/executive-summary       Executive summary
GET    /api/ai/forecast                Demand forecast
```

**AI Query Request:**
```json
{
  "query": "What was our total revenue last quarter?",
  "module": "FINANCE",
  "context": {}
}
```

**AI Query Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Your total revenue for Q3 2026 was $2,450,000, up 12% from Q2.",
    "data": { "revenue": 2450000, "growth": 0.12 },
    "sources": ["finance.invoices", "finance.payments"],
    "tokensUsed": 342,
    "processingTimeMs": 1230
  }
}
```

---

### 📊 Reports & Analytics

```
GET    /api/reports                    List saved reports
POST   /api/reports/generate           Generate report
GET    /api/reports/:id/export         Export (format=pdf|csv|excel|json)
POST   /api/reports/schedule           Schedule report
GET    /api/analytics/dashboard        Dashboard KPIs
GET    /api/analytics/snapshots        Historical snapshots
```

---

### ✅ Workflow & Approvals

```
GET    /api/workflows/templates        Workflow templates
POST   /api/workflows/templates        Create template
GET    /api/workflows/instances        Active instances
POST   /api/workflows/instances        Start instance
GET    /api/workflows/inbox            Approval inbox
POST   /api/workflows/inbox/:id/approve  Approve step
POST   /api/workflows/inbox/:id/reject   Reject step
GET    /api/workflows/history          Approval history
```

---

### 🔧 System Administration

```
GET    /api/admin/settings             System settings
PUT    /api/admin/settings             Update settings
GET    /api/admin/tenants              Tenant list
GET    /api/admin/tenants/:id          Tenant details
GET    /api/admin/users                All users (super admin)
GET    /api/admin/health               Service health checks
GET    /api/admin/metrics              System metrics
GET    /api/admin/logs                 Recent logs
POST   /api/admin/cache/flush          Flush cache
GET    /api/admin/feature-flags        Feature flags
PUT    /api/admin/feature-flags/:key   Toggle feature flag
```

---

## Error Codes Reference

| HTTP Code | Meaning | Common Cause |
|-----------|---------|-------------|
| 400 | Bad Request | Missing or invalid request body fields |
| 401 | Unauthorized | Missing, expired, or invalid JWT token |
| 403 | Forbidden | Insufficient RBAC permissions |
| 404 | Not Found | Resource doesn't exist or wrong tenant |
| 409 | Conflict | Duplicate record (e.g., duplicate email) |
| 422 | Unprocessable | Validation error (detailed errors in response) |
| 429 | Rate Limited | Too many requests — retry after window |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Database or dependency down |

---

## Rate Limits

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| `/api/auth/*` | 20 requests | 15 minutes |
| All other `/api/*` | 300 requests (prod) | 15 minutes |
| `/api/ai/*` | 60 requests | 1 hour |

Rate limit headers on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1720000000
Retry-After: 847
```

---

## Webhook Events

Outbound webhooks fire on:
- `user.created` / `user.updated` / `user.deleted`
- `invoice.created` / `invoice.paid`
- `leave.approved` / `leave.rejected`
- `purchase_order.approved`
- `workflow.completed`

Payload format:
```json
{
  "event": "invoice.paid",
  "tenantId": "uuid",
  "timestamp": "2026-07-11T10:00:00Z",
  "data": { ... }
}
```

Requests are signed with HMAC-SHA256:
```
X-Webhook-Signature: sha256=<hmac>
```
