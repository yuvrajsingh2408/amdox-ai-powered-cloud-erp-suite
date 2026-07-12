# Amdox ERP Backend Foundation

This directory houses the REST API backend service for the **Amdox AI-Powered Cloud ERP Suite**. It is designed with Node.js, Express, TypeScript, and Prisma ORM, fully configured for PostgreSQL and multi-tenancy.

---

## 📂 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # PostgreSQL models (isolated by Tenant boundary)
│   └── seed.ts            # Enterprise seeding script (Users, Roles, Products)
├── src/
│   ├── app.ts             # Express application initialization & middleware loading
│   ├── server.ts          # Core server listener, DB validation & event handlers
│   ├── index.ts           # Forwarder entrypoint to server.ts
│   ├── config/
│   │   ├── db.ts          # Prisma client instantiation
│   │   ├── env.ts         # Zod-validated environment config schema
│   │   └── swagger.ts     # OpenAPI Swagger-JSDoc configurations
│   ├── controllers/       # HTTP Request controller handlers (APIs)
│   │   └── authController.ts
│   ├── services/          # ERP business logic processes
│   │   └── authService.ts
│   ├── repositories/      # Data access layer
│   │   └── userRepository.ts
│   ├── routes/            # Route configurations
│   │   └── authRoutes.ts
│   ├── middleware/        # Express request intercepters (protect, tenant, validate)
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── utils/             # Helper structures
│   │   ├── errors.ts      # Standard application error declarations
│   │   ├── response.ts    # Standard ERP JSON output wrapper
│   │   └── logger.ts      # Console logger utility
│   ├── jobs/              # Scheduled cron operations placeholder
│   └── events/            # Event-Driven Architecture (EDA) emitter triggers
├── Dockerfile             # Multi-stage production container build script
└── package.json
```

---

## ⚙️ Environment Variables

Copy `.env.example` into a new `.env` file inside the `backend` folder:
```bash
cp .env.example .env
```

Ensure all variables are populated:
* `PORT`: Server listening port (default: `5000`).
* `NODE_ENV`: Application environment state (`development` | `production` | `test`).
* `DATABASE_URL`: PostgreSQL connection string.
* `JWT_SECRET`: Token signature key for access tokens (HMAC-SHA256, min 8 chars).
* `JWT_REFRESH_SECRET`: Token signature key for refresh tokens (HMAC-SHA256, min 8 chars).
* `AI_SERVICE_URL`: Base address of the demand forecasting engine.

---

## 🚀 Execution Instructions

### Local Manual Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Database Migrations:**
   Ensure PostgreSQL is running, then deploy the database schema structures:
   ```bash
   npx prisma db push
   ```

3. **Seed Database:**
   Generate initial roles, permissions, a default tenant, and credentialed profiles:
   ```bash
   npx prisma db seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   API Server launches on: `http://localhost:5000`  
   Interactive API Docs: `http://localhost:5000/api-docs`

---

## 🔒 Default Seeding Profiles (Password mapping)

Seed scripts establish the default tenant (`amdox`) and create key test users:
* **Tenant subdomain:** `amdox` (Send in `x-tenant-subdomain` or `x-tenant-id` header)
* **Profiles:**
  * **System Admin**: `admin@amdox.com` (password: `adminpassword`)
  * **HR Manager**: `hr@amdox.com` (password: `hrpassword`)
  * **Finance Manager**: `finance@amdox.com` (password: `financepassword`)
  * **SCM Manager**: `scm@amdox.com` (password: `scmpassword`)
  * **Project Manager**: `manager@amdox.com` (password: `managerpassword`)
  * **Standard Employee**: `employee@amdox.com` (password: `employeepassword`)

---

## 🐳 Running with Docker

Run all containers (Database, Backend, Frontend, and AI Service) simultaneously from the project root:
```bash
docker-compose up --build
```
This automatically boots PostgreSQL, validates database connectivity, runs migrations/seeding, and serves the REST server on Port `5000`.
