# Administrator Guide — Amdox ERP

## Overview

This guide is for system administrators responsible for configuring, managing, and maintaining Amdox ERP.

---

## 1. Initial System Setup

### First-Time Configuration

After deployment, log in as **Super Admin** and complete:

1. **System Settings** (`Admin → Settings`): Configure company name, logo, timezone, default currency
2. **Email (SMTP)** (`Admin → Settings → Email`): Configure SMTP for notifications and reports
3. **Feature Flags** (`Admin → Settings → Features`): Enable/disable modules per your license
4. **Branding** (`Admin → Branding`): Upload logo, set primary colour, configure login page

---

## 2. Tenant Management

Amdox ERP is multi-tenant. Each tenant is an isolated organization.

### Create a Tenant
1. Navigate to **Admin → Tenants**
2. Click **New Tenant**
3. Enter: Name, subdomain, plan, initial admin email
4. System creates the tenant and sends admin invitation email

### Tenant Configuration
- **Admin → Tenants → [Tenant Name]**: View tenant details, usage metrics, API limits
- **Admin → Tenants → Suspend**: Temporarily disable access
- **Admin → Tenants → Delete**: Permanently removes all tenant data (irreversible)

---

## 3. User Management

### Create User
1. Go to **Users → Add User**
2. Fill: Name, email, role, department (optional)
3. User receives email invitation with temporary password

### User Roles

| Role | Access Level |
|------|-------------|
| `SUPER_ADMIN` | Full platform access, cross-tenant |
| `ADMIN` | Full tenant access, user management |
| `MANAGER` | Department-level access, approvals |
| `EMPLOYEE` | Own records, submit requests |
| `READ_ONLY` | View-only access to granted modules |

### Role & Permission Management
- Navigate to **Admin → Roles** to create custom roles
- Navigate to **Admin → Permissions** for the permission matrix
- Assign roles at **Users → [User] → Edit → Role**

---

## 4. RBAC Configuration

### Custom Role Creation
1. Go to **Admin → Roles → New Role**
2. Set role name and base permissions
3. Granular permissions can be toggled in **Admin → Permission Matrix**

### Permission Categories
- **HR**: View Employees, Manage Employees, Process Payroll, Approve Leave
- **Finance**: View Reports, Post Journals, Approve Invoices, Manage Accounts
- **SCM**: View Inventory, Create POs, Approve POs, Receive Goods
- **CRM**: View Leads, Manage Clients, Export Data
- **Admin**: Manage Users, View Audit Logs, Configure System

---

## 5. System Settings Reference

### General (`Admin → Settings → General`)
| Setting | Description |
|---------|-------------|
| Company Name | Displayed in reports and emails |
| Default Currency | System-wide base currency |
| Fiscal Year Start | Financial year start month |
| Timezone | Server timezone for scheduled tasks |
| Date Format | DD/MM/YYYY or MM/DD/YYYY |

### Email (`Admin → Settings → Email`)
| Setting | Description |
|---------|-------------|
| SMTP Host | Mail server hostname |
| SMTP Port | Usually 587 (TLS) or 465 (SSL) |
| SMTP User | Authentication username |
| SMTP Password | Authentication password |
| From Address | Displayed sender email |

### Security (`Admin → Settings → Security`)
| Setting | Description |
|---------|-------------|
| Password Min Length | Minimum characters (default: 8) |
| Password Complexity | Require uppercase, numbers, symbols |
| Session Timeout | Auto-logout after inactivity |
| MFA Required | Enforce MFA for all users |
| Failed Login Lockout | Lock account after N failed attempts |

---

## 6. Workflow Configuration

### Create Approval Workflow
1. Navigate to **Workflows → Templates → New Template**
2. Enter name and trigger (e.g., "Leave Request > 5 days")
3. Add steps: Set approver role/user, SLA hours, escalation path
4. Activate workflow

### Escalation Configuration
- Set SLA (hours) per step in workflow template
- If SLA exceeded: system auto-escalates to next approver
- Configure escalation alerts at **Workflows → Settings**

---

## 7. Monitoring & Maintenance

### System Health
- **Admin → Health**: Real-time status of all services (database, cache, AI, storage)
- **Admin → Telemetry**: Prometheus metrics dashboard
- **Admin → Logs**: Real-time server log viewer

### Performance Monitoring
- **Prometheus**: http://your-server:9090 — raw metrics
- **Grafana**: http://your-server:3001 — visual dashboards
- Key metrics to watch:
  - `http_request_duration_seconds` P95 < 2s
  - Error rate < 1%
  - Database query time < 100ms

### Cache Management
- **Admin → Cache**: View Redis stats and flush specific cache keys
- Full cache flush: **Admin → Cache → Flush All** (use carefully!)

### Scheduled Jobs
- **Admin → Scheduler**: View and manage cron jobs
- Common jobs: Payroll processing, report generation, email notifications, data cleanup

---

## 8. Security Administration

### Security Dashboard (`Security → Dashboard`)
Shows real-time:
- Failed login attempts by IP
- Suspicious activity alerts
- Active sessions count
- MFA adoption rate

### Password Policy
Configure at **Security → Password Policy**:
- Minimum length, complexity requirements
- Maximum age (force rotation)
- History (prevent reuse of last N passwords)

### Audit Logs
All actions are logged at **Security → Audit Events**:
- User logins / logouts
- Data create / update / delete
- Configuration changes
- Failed authentication attempts
- Export audit logs as CSV for compliance

### API Keys Management
- **Security → API Keys**: View, create, revoke API keys
- API keys bypass session auth — treat like passwords
- Rotate keys every 90 days

---

## 9. Backup Administration

### Manual Backup
```bash
docker compose exec db pg_dump -U postgres amdox_erp | gzip > backup.sql.gz
```

### Restore from Backup
```bash
gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres amdox_erp
```

### Backup Schedule
Configure automated backups at **Admin → Backup Center** or via cron.

---

## 10. License Management

- **Admin → License**: View current license, module entitlements, user seat count
- **Admin → Plans**: Upgrade or change subscription plan
- License key is validated on startup; expired licenses restrict access to core modules only

---

## 11. Integration Management

### Third-Party Integrations (`Admin → Integrations`)
Configure connections to:
- Payment gateways (Stripe, PayPal)
- Email providers (SendGrid, Mailgun)
- Cloud storage (AWS S3, GCS)
- LDAP / Active Directory (SSO)

### Webhooks (`Admin → Webhooks`)
Configure outbound webhooks for real-time event notifications:
- Specify URL, secret, and events to subscribe
- Test delivery from the webhook detail page
- View delivery history and retry failed deliveries

---

## 12. Troubleshooting

| Problem | Solution |
|---------|----------|
| User can't login | Check account status, reset password, verify tenant status |
| Emails not sending | Test SMTP settings in Admin → Settings → Email |
| Slow performance | Check Admin → Health, flush cache, review Grafana dashboards |
| Database errors | Check Admin → Logs, verify DATABASE_URL in .env |
| High memory usage | Restart backend container, increase memory limit |
| Missing data | Check tenant ID in requests, verify user permissions |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.
