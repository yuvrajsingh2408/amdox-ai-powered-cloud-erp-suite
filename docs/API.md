# API Reference — Amdox ERP

## Base URL

```
Production:  https://api.amdox.io/api/v1
Development: http://localhost:5000/api
Swagger UI:  http://localhost:5000/api-docs
```

## Authentication

All protected endpoints require:

```http
Authorization: Bearer <access_token>
x-tenant-id: <tenant-uuid>
Content-Type: application/json
```

---

## Response Envelope

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { ... } | [] | null,
  "statusCode": 200
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "statusCode": 400,
  "error": "ValidationError"
}
```

---

## Endpoints

### 🔐 Authentication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register new tenant + admin user | ❌ |
| POST | `/api/auth/login` | Login with email/password | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Invalidate tokens | ✅ |
| GET | `/api/auth/me` | Get current user profile | ✅ |
| POST | `/api/auth/forgot-password` | Send password reset email | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ |

#### POST /api/auth/login

```json
// Request
{
  "email": "admin@company.com",
  "password": "SecureP@ssw0rd"
}

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "role": "ADMIN",
      "tenantId": "uuid"
    }
  }
}
```

---

### 👥 HR & Payroll

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hr/employees` | List employees (paginated) |
| POST | `/api/hr/employees` | Create employee |
| GET | `/api/hr/employees/:id` | Get employee details |
| PUT | `/api/hr/employees/:id` | Update employee |
| DELETE | `/api/hr/employees/:id` | Soft delete employee |
| GET | `/api/hr/attendance` | List attendance records |
| POST | `/api/hr/attendance/clock-in` | Clock in |
| POST | `/api/hr/attendance/clock-out` | Clock out |
| GET | `/api/hr/leaves` | List leave requests |
| POST | `/api/hr/leaves` | Submit leave request |
| PATCH | `/api/hr/leaves/:id/approve` | Approve leave |
| PATCH | `/api/hr/leaves/:id/reject` | Reject leave |
| GET | `/api/payroll/payslips` | List payslips |
| POST | `/api/payroll/process` | Process payroll run |

---

### 💰 Finance & Accounting

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/finance/accounts` | Chart of accounts |
| POST | `/api/finance/accounts` | Create account |
| GET | `/api/finance/journals` | Journal entries |
| POST | `/api/finance/journals` | Create journal entry |
| GET | `/api/finance/invoices` | Accounts receivable |
| POST | `/api/finance/invoices` | Create invoice |
| GET | `/api/finance/bills` | Accounts payable |
| POST | `/api/finance/bills` | Record bill |
| GET | `/api/finance/reports/pl` | P&L report |
| GET | `/api/finance/reports/bs` | Balance sheet |
| GET | `/api/finance/reports/cf` | Cash flow statement |

---

### 📦 Supply Chain & Inventory

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scm/products` | Product catalog |
| GET | `/api/scm/inventory` | Inventory levels |
| POST | `/api/scm/purchase-orders` | Create PO |
| GET | `/api/scm/purchase-orders` | List POs |
| PATCH | `/api/scm/purchase-orders/:id/approve` | Approve PO |
| POST | `/api/scm/goods-receipts` | Receive goods |
| GET | `/api/scm/vendors` | Vendor list |
| POST | `/api/scm/vendors` | Create vendor |

---

### 🤖 AI Copilot

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/query` | Natural language query |
| GET | `/api/ai/insights` | AI-generated insights |
| GET | `/api/ai/recommendations` | AI recommendations |
| POST | `/api/ai/conversations` | Start conversation |
| GET | `/api/ai/conversations/:id/messages` | Get chat history |
| GET | `/api/ai/executive-summary` | Executive summary |
| GET | `/api/ai/forecast` | Demand forecast |

#### POST /api/ai/query

```json
// Request
{
  "query": "How many employees are on leave today?",
  "module": "HR"
}

// Response 200
{
  "success": true,
  "data": {
    "answer": "There are 3 employees on approved leave today...",
    "data": { "count": 3, "employees": [...] },
    "tokensUsed": 245
  }
}
```

---

### 📊 Reports & Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports` | List reports |
| POST | `/api/reports/generate` | Generate custom report |
| GET | `/api/reports/:id/export?format=pdf` | Export report (pdf\|csv\|excel) |
| GET | `/api/analytics/dashboard` | Dashboard KPIs |
| POST | `/api/reports/schedule` | Schedule report |

---

### 🔧 System Administration

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/settings` | Get system settings |
| PUT | `/api/admin/settings` | Update system settings |
| GET | `/api/admin/tenants` | List tenants |
| GET | `/api/admin/tenants/:id` | Tenant details |
| GET | `/api/admin/health` | Service health checks |
| GET | `/api/admin/metrics` | System telemetry |
| GET | `/api/admin/logs` | Server logs |
| POST | `/api/admin/cache/flush` | Flush Redis cache |

---

## Pagination

All list endpoints support:

```
GET /api/hr/employees?page=1&limit=20&sort=createdAt&order=desc&search=John
```

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 247,
      "pages": 13
    }
  }
}
```

---

## Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| Auth endpoints | 20 req | 15 min |
| Global | 300 req | 15 min |
| AI queries | 60 req | 1 hour |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1720000000
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
