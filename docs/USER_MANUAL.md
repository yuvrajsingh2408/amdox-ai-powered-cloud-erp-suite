# User Manual — Amdox ERP

## Welcome to Amdox ERP

Amdox ERP is an AI-powered enterprise resource planning platform covering all aspects of your business operations — from HR and Finance to Supply Chain, CRM, Projects, and more.

---

## Getting Started

### 1. Login

1. Navigate to your Amdox ERP URL (e.g., `https://app.yourdomain.com`)
2. Enter your email address and password
3. Click **Sign In**

> **First Login?** Use the credentials provided by your administrator and change your password immediately via **Profile → Security**.

### 2. Dashboard

After login you land on the **Main Dashboard** which shows:
- Key business KPIs
- Recent activity feed
- Quick access shortcuts
- AI-powered insights

### 3. Navigation

Use the **left sidebar** to navigate between modules:

```
Dashboard
├── HR & Payroll
├── Finance & Accounting
├── Supply Chain & Inventory
├── CRM
├── Projects
├── AI Copilot
├── Reports & Analytics
├── Documents
├── Notifications
├── Workflows & Approvals
└── Settings
```

---

## Modules

### 👥 HR & Payroll

**Employee Management**
- Go to **HR → Directory** to view all employees
- Click **Add Employee** to create a new profile
- Fill in personal details, job information, salary, and documents

**Attendance**
- Go to **HR → Attendance** to view attendance records
- Employees can **Clock In / Clock Out** using the attendance feature
- Managers can view team attendance calendars

**Leave Management**
- Employees: Go to **HR → Leaves → Apply for Leave**
- Select leave type, dates, and add reason
- Status updates to **Pending → Approved/Rejected** by manager

**Payroll Processing**
- Go to **Payroll → Process Payroll**
- Select the pay period and employees
- Review calculations and approve
- Download payslips from **Payroll → Payslips**

---

### 💰 Finance & Accounting

**Chart of Accounts**
- Navigate to **Finance → Chart of Accounts**
- Add accounts with account type (Asset, Liability, Equity, Revenue, Expense)

**Journal Entries**
- Go to **Finance → Journal Entries**
- Click **New Entry** and add debit/credit lines
- Post entry after verification

**Accounts Payable / Receivable**
- **Finance → AP**: Record vendor bills and payments
- **Finance → AR**: Create customer invoices and track payments

**Financial Reports**
- **Finance → Reports**: Generate P&L, Balance Sheet, Cash Flow
- Choose date range and export as PDF or Excel

---

### 📦 Supply Chain & Inventory

**Purchase Process Flow**:
```
Purchase Requisition → Purchase Order → Goods Receipt → Invoice Matching
```

1. **Requisitions**: Employee submits purchase request
2. **Purchase Orders**: Manager creates PO from approved requisition
3. **Goods Receipt**: Warehouse records received items
4. **Inventory**: Automatically updated on receipt

**Vendor Management**
- Go to **SCM → Vendors** to add/edit supplier profiles
- Track vendor performance and payment terms

---

### 🤖 AI Copilot

The AI Copilot answers natural language questions about your business data:

**Examples:**
- *"How many employees are on leave this week?"*
- *"What is our outstanding AR balance?"*
- *"Show me top 5 vendors by spend this quarter"*
- *"Which projects are overdue?"*

Navigate to **AI → Chat** and type your question.

**AI Insights** (`AI → Insights`) provides automated analysis of:
- Spending patterns
- Workforce trends
- Revenue forecasts
- Risk indicators

---

### 📊 Reports & Analytics

**Custom Report Builder**
1. Go to **Reports → Builder**
2. Select module (HR, Finance, SCM, etc.)
3. Choose fields, filters, and date range
4. Click **Generate** and **Export** (PDF, Excel, CSV, JSON)

**Scheduled Reports**
- Set up automated reports to be emailed on a schedule
- Go to **Reports → Scheduled** and click **New Schedule**

---

### ✅ Workflows & Approvals

**Approval Inbox**
- Go to **Workflows → Inbox** to see items awaiting your approval
- Click any item to review details
- Click **Approve** or **Reject** with optional comments

**Workflow Templates**
- Admins can configure multi-step approval workflows at **Workflows → Templates**
- Assign approvers by role or specific user per step

---

### 🔒 Security Settings

**Change Password**
- Go to **Profile → Security → Change Password**

**Two-Factor Authentication (MFA)**
- Go to **Security → MFA Settings**
- Scan QR code with your authenticator app
- Enter verification code to enable

**Active Sessions**
- View and revoke active sessions at **Security → Sessions**

---

## Common Tasks Quick Reference

| Task | Navigation |
|------|-----------|
| Add employee | HR → Directory → Add Employee |
| Approve leave | Workflows → Inbox |
| Create invoice | Finance → AR → New Invoice |
| Generate payroll | Payroll → Process Payroll |
| Create PO | SCM → Purchase Orders → New PO |
| Ask AI a question | AI → Chat |
| Download report | Reports → Builder → Generate → Export |
| View notifications | Bell icon (top right) |
| Change password | Profile → Security |
| Upload document | DMS → Files → Upload |

---

## Tips & Best Practices

1. **Use the AI Copilot** for quick data queries — faster than navigating to reports
2. **Set up approval workflows** before processing transactions
3. **Check the Approval Inbox daily** to avoid SLA breaches
4. **Schedule reports** for regular stakeholders to save time
5. **Use filters** on all list pages to find records quickly
6. **Export data** regularly for offline backups and compliance

---

## Getting Help

- **In-App**: Click the **?** icon in any page for contextual help
- **Knowledge Base**: Navigate to **Support → Knowledge Base**
- **IT Support**: Contact your system administrator
- **Admin Guide**: See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for advanced configuration
