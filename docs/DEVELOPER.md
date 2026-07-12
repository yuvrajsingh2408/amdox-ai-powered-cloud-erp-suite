# Developer Guide — Amdox ERP

## Setup for Development

### Prerequisites
- Node.js 20.x LTS
- npm 10.x
- PostgreSQL 16
- Git

### 1. Clone and Bootstrap

```bash
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp
cp .env.example .env
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push       # Push schema to local DB
npx prisma db seed       # Seed test data
npm run dev              # ts-node-dev with hot reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev              # Vite dev server at :3000
```

---

## Code Conventions

### Backend

| Pattern | Convention |
|---------|-----------|
| File naming | `camelCase.suffix.ts` (e.g., `authController.ts`) |
| Route files | `routeName.routes.ts` |
| Services | `domainName.service.ts` |
| Controllers | `domainName.controller.ts` |
| Response | Always use `sendResponse()` helper |
| Error handling | Throw `new AppError(message, statusCode)` |

### Response Format (All APIs)

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... } | null,
  "statusCode": 200
}
```

### Error Format

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

## Adding a New Module

1. **Define Prisma models** in `backend/prisma/schema.prisma`
2. **Run** `npx prisma db push` to sync
3. **Create service** `backend/src/services/newModuleService.ts`
4. **Create controller** `backend/src/controllers/newModuleController.ts`
5. **Create routes** `backend/src/routes/newModule.routes.ts`
6. **Register routes** in `backend/src/routes/index.ts`
7. **Create frontend pages** in `frontend/src/pages/`
8. **Register routes** in `frontend/src/App.tsx`
9. **Add nav items** to `frontend/src/components/common/Sidebar.tsx`

---

## API Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
x-tenant-id: <tenant-uuid>
```

To authenticate in tests:
```typescript
const loginRes = await request(app)
  .post('/api/auth/login')
  .send({ email: 'admin@test.com', password: 'Test@123' });

const token = loginRes.body.data.token;
const tenantId = loginRes.body.data.user.tenantId;

// Use in subsequent requests
await request(app)
  .get('/api/some-protected-route')
  .set('Authorization', `Bearer ${token}`)
  .set('x-tenant-id', tenantId);
```

---

## Testing Guidelines

```bash
# Run all tests
cd backend && npm test

# Watch mode
cd backend && npm run test:watch

# Coverage
cd backend && npm run test:coverage
```

### Test File Naming
- Unit tests: `tests/unit/<module>.test.ts`
- Integration tests: `tests/integration/<endpoint>.test.ts`

---

## Git Workflow

```
main          ← production releases (tagged)
  └── develop ← integration branch
        └── feature/feature-name  ← feature branches
        └── fix/bug-description   ← bug fixes
        └── chore/task-name       ← maintenance
```

### Commit Convention (Conventional Commits)

```
feat: add vendor payment processing
fix: resolve leave approval race condition
chore: update dependencies
docs: add API documentation for HR endpoints
test: add integration tests for auth module
refactor: extract payroll calculation to service layer
```

---

## Environment Variables Reference

See [`.env.example`](../.env.example) for full reference.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 64 chars |
| `JWT_REFRESH_SECRET` | ✅ | Min 64 chars |
| `REDIS_URL` | ⚪ | Redis for caching (optional in dev) |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |

---

## Performance Tips

- Use `prisma.$queryRaw` for complex aggregations
- Always paginate list endpoints: `?page=1&limit=20`
- Use `select` in Prisma queries to limit returned fields
- Frontend: wrap heavy pages in `React.lazy()` + `<Suspense>`
