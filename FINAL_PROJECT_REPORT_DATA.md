# Internship Project Report: Amdox AI-Powered Cloud ERP Suite

---

## 1. Project Title
**Amdox AI-Powered Cloud ERP Suite**  
*An Enterprise-Grade, Multi-Tenant SaaS Enterprise Resource Planning Platform with NLP Analytics, Automated Workflows, and Advanced Accounting Ledger.*

---

## 2. Abstract
The modern business landscape requires rapid operational coordination, intelligent analytics, and unified control over diverse business operations—from Human Resources and double-entry general ledgers to inventory distributions and supply chains. Legacy Enterprise Resource Planning (ERP) platforms represent massive cost sinks, feature outdated client layouts, and fail to provide natural language database inquiry capabilities or proactive recommendations. This report outlines the design, implementation, and deployment of **Amdox ERP**, a full-stack, multi-tenant Software-as-a-Service (SaaS) suite engineered during the Amdox Technologies internship. 

Built using a React 18 Single-Page Application (SPA) frontend and a Node.js Express backend in TypeScript, the platform operates on serverless cloud nodes. Data storage and logical isolation are handled by a serverless Neon PostgreSQL cluster coordinated through Prisma Object-Relational Mapping (ORM). Logical multi-tenancy is enforced at the database layer via `tenantId` schema attributes and Express router interception middleware. Security systems integrate JSON Web Tokens (JWT) access/refresh token rotation, dynamic Role-Based Access Control (RBAC), and custom security filters that bypass CSRF checks for token-based Bearer client queries. 

Furthermore, Amdox ERP features an inline **AI Copilot** (Natural Language Processing engine) that maps search phrases directly to database tables, providing text summaries and visual reports (Recharts). The entire suite is automated, containerized with Docker, configured with Kubernetes deployment files, monitored through Prometheus/Grafana, and is fully deployed to live production.

---

## 3. Problem Statement
Enterprise operations require managing numerous departments (Accounting, Human Resources, Supply Chain, CRM, Projects, and Workflows) under a single source of truth. Existing options present severe limitations:
1. **Financial Obstacles:** High licensing fees prevent small-to-medium enterprises (SMEs) from adopting systems.
2. **Poor User Interfaces:** Obsolete layouts decrease worker speed and increase data entry errors.
3. **Data Silos and Analytical Inefficiencies:** Extracting insights requires manual database operations rather than natural, conversational inquiries.
4. **Data Isolation Vulnerabilities:** Lightweight multi-tenant architectures struggle to isolate database transactions cleanly.
5. **Rigid Integrations:** Implementing automated workflow approvals with customizable escalation triggers requires complex coding.

---

## 4. Objectives
The development of Amdox ERP set out to achieve the following:
* **Multi-Tenant Logical Isolation:** Secure logical boundaries using `tenantId` scopes at the ORM layer.
* **Intelligent AI Copilot:** Build an NLP query engine to retrieve leaves, overdue invoices, and stocks using plain English.
* **Comprehensive ERP Modules:** Implement 14+ business modules (HR, Accounting, Payroll, SCM, CRM, and Workflows).
* **Double-Entry General Ledger:** Create a Chart of Accounts tracking assets, liabilities, equities, revenues, and expenses.
* **Modern Interface:** Design a premium glassmorphic dashboard utilizing dynamic charts and micro-animations.
* **Production-Grade DevOps Pipeline:** Achieve zero-downtime serverless deployments to Vercel and Neon PostgreSQL.

---

## 5. Existing System
Traditional ERP frameworks rely on monolithic software architectures (e.g. SAP ERP, local Oracle environments):
* **On-Premise Dependence:** High hardware overhead.
* **Static Databases:** Rigid SQL schemas that make custom adjustments costly.
* **Manual Data Aggregation:** Reports must be generated manually by technical staff.
* **Inflexible Licensing:** Lacks self-service onboarding or dynamic tenant seat allocation.

---

## 6. Proposed System
Amdox ERP addresses these issues with a cloud-native, multi-tenant architecture:
* **Cloud-Native SaaS:** On-demand scalability with serverless functions and Neon PostgreSQL.
* **Logical Database Separation:** Every database row is linked to a Tenant UUID.
* **System-Aware AI Copilot:** Instantly converts natural language questions into database queries.
* **Automated Workflow Engine:** Empowers managers to design multi-tier approval flows.
* **Unified SPA Layout:** Clean dashboards with dynamic analytical widgets.

---

## 7. Features Implemented

### Authentication & User Management
Multi-tenant registration, user profiles, login histories, device records, and role matrices.

### HR Management
Employee directories, department charts, and designation logs.

### Leave Management
Submitting leave requests (SICK, CASUAL, MATERNITY), approving/rejecting requests, and checking team calendars.

### Attendance
Clock-in/out logs, work hours calculation, and geographic location tracking.

### Payroll Processing
Salary structure definitions, tax calculation, and automated payslip generation.

### Finance Ledger
Double-Entry general ledger, chart of accounts, journal entries, and balance sheets.

### Accounts Receivable (AR) & Invoices
Invoice drafting, tracking due dates, and recording customer payments.

### Accounts Payable (AP) & Bills
Recording supplier bills, managing payment schedules, and verifying purchases.

### Inventory & SCM
Supplier logs, catalog tracking, stocks, warehouses, and reorder levels.

### Purchase Orders & Goods Receipts
Purchase requests, supervisor approvals, goods receipts, and inventory updates.

### CRM & Sales Pipeline
Client leads, sales opportunities, value tracking, and meeting reminders.

### Project & Task Management
Milestones, sprints, tasks, resource allocations, and attachments.

### AI Copilot & Business Intelligence
Plain-text database queries, executive summaries, stock forecasting, and custom chart builders.

### Workflow & Approvals
Automated approval sequences, manager inbox dashboards, and escalation rules.

### Document Management
Folder structure, secure uploads, sharing logs, and revision comment histories.

### Portal Integrations
Dedicated spaces for customers and vendors to review transactions.

### System Administration
Tenant settings, branding configurations, cache flushes, and database backups.

---

## 8. Functional Requirements (F01 to F12)

* **F01: Tenant Self-Service Onboarding:** Users must be able to register a workspace and subdomain.
* **F02: Role-Based Routing:** System must intercept routes and authorize based on permissions.
* **F03: Attendance Tracking:** Workers must be able to log clock-in/out times.
* **F04: Leave Lifecycle:** Employees must be able to submit leave requests, notifying managers for approval.
* **F05: Payroll Calculator:** System must calculate taxes, benefits, and net payouts to generate monthly payslips.
* **F06: General Ledger:** Must record double-entry journal logs where debits equal credits.
* **F07: Invoice Lifecycle:** Managers must be able to issue invoices and record partial/full payments.
* **F08: Inventory Control:** System must track item stocks and log stock movements.
* **F09: Purchase Order Verification:** Warehouse staff must be able to receive products, auto-updating stock levels.
* **F10: AI NLP Inquiries:** Users must be able to query the database using plain English.
* **F11: Workflow Automation:** Supervisors must be able to configure multi-step approval pipelines.
* **F12: Document Control:** Employees must be able to upload files and assign access permissions.

---

## 9. Non-Functional Requirements

* **Scalability:** Handle dynamic API traffic changes using serverless cloud workers.
* **Security:** Store passwords using Bcrypt hashing and verify sessions using JWT rotation.
* **Data Integrity:** Prevent cross-tenant leaks via tenant-scoped ORM queries.
* **Performance:** Ensure page loads complete in under 1.5 seconds.
* **Availability:** Target 99.9% uptime by running backend nodes on high-availability cloud regions.

---

## 10. Complete Technology Stack

```
   FRONTEND LAYER         API / BACKEND LAYER         DATABASE & CACHE
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────────┐
│  React 18        │     │  Node.js 20       │     │  Neon PostgreSQL    │
│  TypeScript      │────>│  Express          │────>│  Prisma Client ORM  │
│  Vite Bundler    │     │  TypeScript       │     │  Redis 7 Cache      │
│  Tailwind CSS    │     │  JWT Auth / RBAC  │     └─────────────────────┘
└──────────────────┘     └───────────────────┘
```

* **Frontend:** React 18, TypeScript, Vite, React Router DOM, Recharts, Axios.
* **Backend:** Node.js 20, Express, TypeScript, Zod validations, winston logging.
* **Database & ORM:** Neon Serverless PostgreSQL, Prisma Client, Redis 7.
* **AI Service:** Python FastAPI, custom keyword NLP mapping.
* **Deployment:** Vercel edge runtime, GitHub Actions CI/CD pipelines.

---

## 11. Complete Project Architecture

```mermaid
graph TD
    Client[React 18 SPA - Client] -->|HTTPS Requests| VercelGateway[Vercel Edge Proxy]
    VercelGateway -->|Path routing| ExpressApp[Express API Server]
    
    subgraph Express Engine
        ExpressApp --> Logger[winston Logger]
        ExpressApp --> RateLimit[express-rate-limit]
        ExpressApp --> CORS[CORS Handler]
        ExpressApp --> TenantMW[tenant.middleware.ts]
        ExpressApp --> AuthMW[auth.middleware.ts]
        ExpressApp --> CSRFMW[csrf.middleware.ts]
        
        TenantMW --> Controller[Controller Layer]
        AuthMW --> Controller
        CSRFMW --> Controller
        
        Controller --> Service[Service Layer]
    end
    
    Service -->|Prisma Client| Postgres[(Neon PostgreSQL Cloud)]
    Service -->|Cache / Sessions| Redis[(Redis Cache)]
    Service -->|NLP queries| FastAPI[FastAPI AI Engine]
```

---

## 12. Folder Structure with Explanation

```
amdox-erp/
├── backend/                              # Node.js backend root
│   ├── prisma/                           # Database mappings
│   │   ├── schema.prisma                 # Schema models definition
│   │   └── seed.ts                       # Seeder populate script
│   ├── src/
│   │   ├── app.ts                        # Application configuration
│   │   ├── server.ts                     # Port listener and runtime startup
│   │   ├── controllers/                  # Translates HTTP data into parameters
│   │   ├── middleware/                   # Request authorization filters
│   │   ├── routes/                       # Route files mapped by module
│   │   ├── services/                     # Business logic computations
│   │   └── utils/                        # Response formatters and logs
│   ├── tests/                            # Jest testing suites
│   └── vercel.json                       # Serverless deployment configuration
│
├── frontend/                             # React frontend root
│   ├── src/
│   │   ├── main.tsx                      # Bootstrap entry point
│   │   ├── App.tsx                       # Global page routes map
│   │   ├── context/                      # State stores (AuthContext)
│   │   └── pages/                        # Interface views (146 pages)
│   └── vite.config.ts                    # Bundling configurations
```

---

## 13. Database Design

### Schema Overview

Amdox ERP relies on logical multi-tenant separation. Every entity contains a `tenantId` field linking to the central `Tenant` table.

```mermaid
erDiagram
    TENANT ||--o{ USER : contains
    TENANT ||--o{ ROLE : defines
    TENANT ||--o{ EMPLOYEE : employs
    USER ||--o{ REFRESH_TOKEN : maintains
    USER ||--o{ USER_ROLE : assigned
    ROLE ||--o{ USER_ROLE : links
    ROLE ||--o{ ROLE_PERMISSION : holds
    PERMISSION ||--o{ ROLE_PERMISSION : maps
    EMPLOYEE ||--o{ LEAVE : requests
    EMPLOYEE ||--o{ ATTENDANCE : logs
    TENANT ||--o{ ACCOUNT : charts
    ACCOUNT ||--o{ TRANSACTION_LINE : details
    TRANSACTION ||--o{ TRANSACTION_LINE : posts

    TENANT {
        string id PK
        string name
        string subdomain
        string status
        string currency
    }
    USER {
        string id PK
        string email
        string passwordHash
        string tenantId FK
    }
    EMPLOYEE {
        string id PK
        string employeeCode
        string firstName
        string lastName
        string departmentId FK
        float salary
    }
    LEAVE {
        string id PK
        string employeeId FK
        string leaveType
        date startDate
        date endDate
        string status
    }
    ACCOUNT {
        string id PK
        string code
        string name
        string type
        float balance
    }
```

---

## 14. API Documentation

| Endpoint | Method | Purpose | Auth Required | Request Payload | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Onboards new tenant | No | `{email, password, companyName, subdomain}` | Tenant and user details |
| `/api/auth/login` | `POST` | User authentication | No | `{email, password}` | User profile + JWT token |
| `/api/auth/refresh` | `POST` | Token rotation | No | — | New JWT token |
| `/api/hr/employees` | `GET` | List workforce | Yes | — | Employees list |
| `/api/hr/leaves` | `POST` | Submit leave request | Yes | `{startDate, endDate, leaveType}` | Created leave request |
| `/api/hr/leaves/:id/approve` | `PATCH` | Approve leave request | Yes | `{status: "APPROVED"}` | Updated leave request |
| `/api/payroll/process` | `POST` | Runs monthly payroll | Yes | `{month, year}` | Generated payslips |
| `/api/finance/accounts` | `GET` | Chart of Accounts | Yes | — | Chart list |
| `/api/finance/journals` | `POST` | Record journal entry | Yes | `{description, lines: [debit, credit]}`| Created transaction |
| `/api/scm/products` | `GET` | Retrieve catalog | Yes | — | Products array |
| `/api/scm/purchase-orders` | `POST` | Issue purchase order | Yes | `{vendorId, items}` | Created PO |
| `/api/ai/query` | `POST` | AI Copilot query | Yes | `{query}` | AI text response + chart data |

---

## 15. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant API as Express API Server
    participant DB as Neon PostgreSQL

    User->>API: POST /api/auth/login {email, password}
    API->>DB: Query User by Email
    DB-->>API: Returns User Record (hashed password)
    API->>API: Verify password hash (Bcrypt)
    API->>API: Generate Access Token (15m) & Refresh Token (7d)
    API-->>User: Set-Cookie (Refresh Token) & Response JSON (Access Token)
```

---

## 16. Authorization & Role-Based Access Control (RBAC)

Authorization check middleware intercept routes before invoking target controllers:
* **Roles:** ADMIN, HR_MANAGER, FINANCE_MANAGER, SCM_MANAGER, PROJECT_MANAGER, EMPLOYEE.
* **Permission Enforcements:** Mapped in join tables (`UserRole` and `RolePermission`).
* **Multi-Tenant Boundaries:** Scopes all operations using `tenantId`.

---

## 17. Security Features

* **JWT Rotation:** Invalidates refresh tokens on reuse and checks user agent consistency.
* **Double CORS Mapping:** Dynamic origin matching for `.vercel.app` branches.
* **CSRF Bearer Exemption:** Bypasses CSRF checks for requests with an `Authorization: Bearer` header.
* **Input Sanitization:** Express limits request payloads to 10kb to prevent Denial of Service (DoS) attacks.
* **Secure Hashing:** Salts and encrypts passwords using Bcrypt.

---

## 18. AI Features

* **Natural Language Query Engine:** Maps queries to database filters to retrieve records.
* **BI Visualizer:** Embeds chart specifications inside replies to render Recharts dynamically.
* **Proactive System Scans:** Alerts users to stock shortages or overdue invoices.

---

## 19. Validation Techniques

All schemas are validated using the **Zod** schema validation library:
```typescript
export const createEmployeeSchema = zod.object({
  firstName: zod.string().min(2, "First name must be at least 2 characters"),
  lastName: zod.string().min(2, "Last name must be at least 2 characters"),
  email: zod.string().email("Invalid email format"),
  salary: zod.number().positive("Salary must be positive"),
  departmentId: zod.string().uuid("Invalid department identifier"),
});
```

---

## 20. Error Handling

Express uses a global error boundary to translate exceptions into standardized response envelopes:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access Denied: Insufficient Permissions",
  "data": null,
  "error": "ForbiddenError"
}
```

---

## 21. Logging

The application uses **Winston** for logging, writing JSON logs categorized by level (info, warn, error) to both the console and Loki.

---

## 22. File Upload System

Managed by `Cravat Document Provider` routers:
* Files are uploaded to cloud object storage.
* Tracks permissions and revisions (`DocumentPermission` and `DocumentComment`).

---

## 23. Dashboard Analytics

Aggregates operational metrics across modules:
* Accounts receivable totals.
* Attendance rates.
* Stock values and warehouse fill percentages.

---

## 24. Reports Module

Generates custom business reports:
* **Formats:** PDF, CSV, Excel.
* **Schedules:** Supports scheduled email updates (`ScheduledReport`).

---

## 25. Employee Module

Manages employee listings, designations, reporting lines, and contact information.

---

## 26. HR Module

Tracks organizational structures, departments, roles, and hiring logs.

---

## 27. Finance Module

Manages accounts, transactions, invoices, bill tracking, and cash flow reports.

---

## 28. Inventory Module

Tracks warehouses, safety stock levels, catalog SKUs, and stock movements.

---

## 29. Project Management Module

Tracks project milestones, sprints, tasks, resource allocations, and timesheets.

---

## 30. CRM Module

Tracks client contact details, leads, opportunities, deals, and meetings.

---

## 31. Leave Management

Processes leave submissions, checking employee balances and updating managers.

---

## 32. Payroll

Calculates payroll runs, including base salary adjustments, taxes, deductions, and payslips.

---

## 33. Notifications

Dispatches notifications across channels (in-app alerts, emails, push alerts).

---

## 34. Settings

Allows system-wide configurations, including local currency preferences and system branding.

---

## 35. Performance Optimizations

* **Prisma Connection Pool:** Uses connection pooling to manage cloud database connections efficiently.
* **React Chunk Splitting:** Splits bundles by routing boundary to optimize initial load times.
* **Indices Mapping:** Implements database indices on `tenantId` and `deletedAt` columns.

---

## 36. Deployment Process

### Frontend (Static Page Router)
Built and deployed to Vercel, with page routing configured in `frontend/vercel.json`.

### Backend (Serverless)
Deployed to Vercel Serverless Functions, routing requests to `api/index.ts`.

---

## 37. CI/CD Process

Workflow automation via GitHub Actions:
```yaml
name: Build Verification Pipeline
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 38. Testing Performed

* **Unit Tests:** Verified validation rules and mapping helpers.
* **Integration Tests:** Verified middlewares, router permissions, and token validation.
* **End-to-End Tests:** Verified the login flow and dashboard navigation.

---

## 39. Challenges Faced

1. **PostgreSQL Migration Errors:** SQLite migrations were incompatible with Neon PostgreSQL.
2. **TypeScript Compilation Errors:** Vite compilation failed due to missing `ImportMeta` typings.
3. **CORS and CSRF Blocks:** Vercel gateway overrides blocked cross-origin credentials.

---

## 40. Solutions Implemented

1. **Schema Syncing:** Used `prisma db push` to sync schemas and ran the database seeder to initialize tables.
2. **TypeScript Fix:** Cast `import.meta` as `any` in Vite configurations.
3. **CORS Fix:** Removed gateway header overrides and configured dynamic CORS origin matching.

---

## 41. Future Enhancements

* **WebSockets Integration:** Real-time dashboard updates.
* **Predictive Forecasting:** Incorporate time-series models for cash flow predictions.
* **Automated Audit Visualizer:** Admin interface to review audit logs.

---

## 42. Conclusion

The **Amdox AI-Powered Cloud ERP Suite** provides a secure, scalable, and user-friendly ERP solution. By combining a modern React/Express architecture with a serverless Neon database and an NLP-capable AI Copilot, it offers businesses an efficient platform for enterprise operations.

---

## Software & Hardware Specifications

### Software Requirements
* **Operating System:** Windows 10/11, macOS, Linux
* **Runtime Environment:** Node.js v20.x
* **Database Engine:** PostgreSQL v16.x

### Hardware Requirements
* **CPU:** Quad-Core 2.4GHz
* **RAM:** 8GB
* **Disk Space:** 500MB

### Browser Support
* Google Chrome (v100+)
* Mozilla Firefox (v100+)
* Apple Safari (v15+)
* Microsoft Edge (v100+)

---

## Deployment Information

* **GitHub Repository:** [yuvrajsingh2408/amdox-ai-powered-cloud-erp-suite](https://github.com/yuvrajsingh2408/amdox-ai-powered-cloud-erp-suite)
* **Frontend URL:** [https://frontend-rho-lovat-59.vercel.app](https://frontend-rho-lovat-59.vercel.app)
* **Backend URL:** [https://backend-six-inky-25.vercel.app](https://backend-six-inky-25.vercel.app)
* **Database Target:** Neon Serverless PostgreSQL Cloud

---

## Project Specifications

### Backend Dependencies (npm)
* `@prisma/client`
* `express`
* `jsonwebtoken`
* `bcryptjs`
* `cors`
* `helmet`
* `zod`
* `winston`
* `express-rate-limit`
* `prom-client`

### Frontend Dependencies (npm)
* `react`
* `react-dom`
* `react-router-dom`
* `recharts`
* `axios`
* `lucide-react`

### Environment Variables (.env)
```bash
# Database connection string
DATABASE_URL="postgresql://neondb_owner:***@ep-winter-bread-aorrfkvc-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Auth secrets
JWT_SECRET="amdox_jwt_secret_token_key"
JWT_REFRESH_SECRET="amdox_refresh_token_secret_key"
COOKIE_SECRET="cookie_decryption_secret_hash"

# Mode
NODE_ENV="production"
```

### Build & Deployment Commands
```bash
# Build backend
cd backend && npm run build

# Deploy backend
vercel --prod --yes --cwd backend

# Build frontend
cd frontend && npm run build

# Deploy frontend
vercel --prod --yes --cwd frontend
```

---

## Additional Information

### Timeline
* **Week 1-2:** Setup architectures and design schemas.
* **Week 3-4:** Implement core modules (HR, Accounting).
* **Week 5-6:** Build the AI Copilot and analytics engine.
* **Week 7-8:** Cloud deployment, testing, and documentation.

### Design Patterns Used
* **Thin Controllers:** Controllers only handle input validation.
* **Isolated Services:** Business logic is isolated from database drivers.
* **Data Access Layer:** Uses Prisma Client to isolate database queries.
* **Factory Pattern:** Dynamically initializes AI model providers.
