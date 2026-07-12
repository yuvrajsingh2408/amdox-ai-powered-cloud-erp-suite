import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise ERP database seeding...');

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'amdox' },
    update: {},
    create: {
      name: 'Amdox Corp',
      subdomain: 'amdox',
      status: 'ACTIVE',
    },
  });
  console.log(`🏢 Created Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Create Dynamic Permissions
  const permissionsList = [
    { name: 'READ_USERS', description: 'Can read all users' },
    { name: 'WRITE_USERS', description: 'Can create or modify users' },
    { name: 'MANAGE_HR', description: 'Can manage employee directory and departments' },
    { name: 'PROCESS_PAYROLL', description: 'Can run payroll cycles and issue payslips' },
    { name: 'MANAGE_FINANCE', description: 'Can view COA and post journal entries' },
    { name: 'MANAGE_SCM', description: 'Can manage vendors and purchase orders' },
    { name: 'MANAGE_INVENTORY', description: 'Can view warehouses and manage stock movement' },
    { name: 'MANAGE_PROJECTS', description: 'Can manage projects, tasks and resource allocations' },
  ];

  const dbPermissions = [];
  for (const perm of permissionsList) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    dbPermissions.push(record);
  }
  console.log(`🔑 Seeded ${dbPermissions.length} core permissions.`);

  // 3. Create Dynamic Roles
  const rolesList = [
    { name: 'ADMIN', description: 'System Administrator with full access' },
    { name: 'HR_MANAGER', description: 'Manages HR records and payroll runs' },
    { name: 'FINANCE_MANAGER', description: 'Manages ledger journals, invoices and financial records' },
    { name: 'SCM_MANAGER', description: 'Manages vendors, inventory levels and supply chains' },
    { name: 'PROJECT_MANAGER', description: 'Oversees projects, schedules tasks and allocates staff' },
    { name: 'EMPLOYEE', description: 'Standard employee portal access' },
  ];

  const dbRoles = [];
  for (const roleDef of rolesList) {
    const roleRecord = await prisma.role.upsert({
      where: {
        name_tenantId: {
          name: roleDef.name,
          tenantId: tenant.id,
        },
      },
      update: {},
      create: {
        name: roleDef.name,
        description: roleDef.description,
        tenantId: tenant.id,
      },
    });
    dbRoles.push(roleRecord);
  }
  console.log(`👥 Seeded ${dbRoles.length} ERP tenant roles.`);

  // 4. Map Permissions to Roles
  // Admin gets all permissions
  const adminRole = dbRoles.find(r => r.name === 'ADMIN')!;
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // HR Manager gets MANAGE_HR and PROCESS_PAYROLL
  const hrRole = dbRoles.find(r => r.name === 'HR_MANAGER')!;
  const hrPermNames = ['READ_USERS', 'MANAGE_HR', 'PROCESS_PAYROLL'];
  for (const perm of dbPermissions.filter(p => hrPermNames.includes(p.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: hrRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: hrRole.id, permissionId: perm.id },
    });
  }

  // Finance Manager gets MANAGE_FINANCE and PROCESS_PAYROLL
  const finRole = dbRoles.find(r => r.name === 'FINANCE_MANAGER')!;
  const finPermNames = ['MANAGE_FINANCE', 'PROCESS_PAYROLL'];
  for (const perm of dbPermissions.filter(p => finPermNames.includes(p.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: finRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: finRole.id, permissionId: perm.id },
    });
  }

  // SCM Manager gets MANAGE_SCM and MANAGE_INVENTORY
  const scmRole = dbRoles.find(r => r.name === 'SCM_MANAGER')!;
  const scmPermNames = ['MANAGE_SCM', 'MANAGE_INVENTORY'];
  for (const perm of dbPermissions.filter(p => scmPermNames.includes(p.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: scmRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: scmRole.id, permissionId: perm.id },
    });
  }

  // Project Manager gets MANAGE_PROJECTS
  const pmRole = dbRoles.find(r => r.name === 'PROJECT_MANAGER')!;
  const pmPermNames = ['MANAGE_PROJECTS'];
  for (const perm of dbPermissions.filter(p => pmPermNames.includes(p.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: pmRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: pmRole.id, permissionId: perm.id },
    });
  }
  console.log('🔗 Mapped role-to-permission security matrices.');

  // 5. Create Core Departments
  const departmentsDef = [
    { name: 'Administration' },
    { name: 'Finance & Accounts' },
    { name: 'Human Resources' },
    { name: 'Supply Chain' },
    { name: 'IT Engineering' },
  ];

  const dbDepts = [];
  for (const dept of departmentsDef) {
    const record = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        name: dept.name,
        tenantId: tenant.id,
      },
    });
    dbDepts.push(record);
  }
  console.log(`🏢 Seeded ${dbDepts.length} organizational departments.`);

  // 6. Create Users & Map Roles
  const usersToSeed = [
    { email: 'admin@amdox.com', pass: 'adminpassword', first: 'Amdox', last: 'Admin', role: 'ADMIN' },
    { email: 'hr@amdox.com', pass: 'hrpassword', first: 'Sarah', last: 'HR', role: 'HR_MANAGER' },
    { email: 'finance@amdox.com', pass: 'financepassword', first: 'Mark', last: 'Finance', role: 'FINANCE_MANAGER' },
    { email: 'scm@amdox.com', pass: 'scmpassword', first: 'Gary', last: 'SCM', role: 'SCM_MANAGER' },
    { email: 'manager@amdox.com', pass: 'managerpassword', first: 'David', last: 'PM', role: 'PROJECT_MANAGER' },
    { email: 'employee@amdox.com', pass: 'employeepassword', first: 'John', last: 'Employee', role: 'EMPLOYEE' },
  ];

  for (const uInfo of usersToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: uInfo.email } });
    let dbUser;
    if (!existing) {
      const passwordHash = await bcrypt.hash(uInfo.pass, 10);
      dbUser = await prisma.user.create({
        data: {
          email: uInfo.email,
          passwordHash,
          firstName: uInfo.first,
          lastName: uInfo.last,
          tenantId: tenant.id,
          status: 'ACTIVE',
        },
      });
      console.log(`👤 Created User: ${uInfo.email} (password: ${uInfo.pass})`);
    } else {
      dbUser = existing;
      console.log(`👤 User already exists: ${uInfo.email}`);
    }

    // Bind User to Role
    const rMatch = dbRoles.find(r => r.name === uInfo.role)!;
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: dbUser.id,
          roleId: rMatch.id,
        },
      },
      update: {},
      create: {
        userId: dbUser.id,
        roleId: rMatch.id,
      },
    });

    // Create Employee record for non-Admin users
    if (uInfo.role !== 'ADMIN') {
      const existingEmployee = await prisma.employee.findFirst({
        where: { email: uInfo.email },
      });
      if (!existingEmployee) {
        const empDept = dbDepts.find(d => 
          uInfo.role === 'HR_MANAGER' ? d.name === 'Human Resources' :
          uInfo.role === 'FINANCE_MANAGER' ? d.name === 'Finance & Accounts' :
          uInfo.role === 'SCM_MANAGER' ? d.name === 'Supply Chain' :
          d.name === 'IT Engineering'
        )!;

        const employee = await prisma.employee.create({
          data: {
            userId: dbUser.id,
            employeeCode: `EMP-${uInfo.email.split('@')[0].toUpperCase()}`,
            firstName: uInfo.first,
            lastName: uInfo.last,
            email: uInfo.email,
            departmentId: empDept.id,
            designation: uInfo.role.replace('_', ' '),
            dateOfJoining: new Date(),
            salary: 80000.0,
            tenantId: tenant.id,
            status: 'ACTIVE',
          },
        });
        console.log(`👔 Linked Employee code: ${employee.employeeCode}`);
      }
    }
  }

  // 7. Create Chart of Accounts
  const accountsDef = [
    { code: '1010', name: 'Cash and Bank Assets', type: 'ASSET', balance: 50000.00 },
    { code: '1200', name: 'Accounts Receivables (AR)', type: 'ASSET', balance: 12000.00 },
    { code: '1400', name: 'Inventory Asset Value', type: 'ASSET', balance: 25000.00 },
    { code: '2010', name: 'Accounts Payables (AP)', type: 'LIABILITY', balance: 8000.00 },
    { code: '3010', name: 'Owner Equity Capital', type: 'EQUITY', balance: 65000.00 },
    { code: '4010', name: 'Product Sales Revenues', type: 'REVENUE', balance: 20000.00 },
    { code: '5015', name: 'Rent & Lease Expenses', type: 'EXPENSE', balance: 4000.00 },
    { code: '5020', name: 'Employee Salary Expenses', type: 'EXPENSE', balance: 12000.00 },
  ];

  for (const acc of accountsDef) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        tenantId: tenant.id,
      },
    });
  }
  console.log(`🪙 Seeded chart accounts for Tenant Ledger.`);

  // 8. Create Warehouse Depots
  const warehousesDef = [
    { name: 'Primary Warehouse A', location: 'Section 4, Industrial Area', code: 'WH-A' },
    { name: 'Sub-Depot B', location: 'Building B-12, Logistic Hub', code: 'WH-B' },
  ];

  const dbWarehouses = [];
  for (const wh of warehousesDef) {
    const record = await prisma.warehouse.upsert({
      where: { name: wh.name },
      update: {},
      create: {
        name: wh.name,
        location: wh.location,
        code: wh.code,
        tenantId: tenant.id,
      },
    });
    dbWarehouses.push(record);
  }
  console.log(`📦 Seeded warehouse distribution sites.`);

  // 9. Create SCM Vendor
  const vendor = await prisma.vendor.upsert({
    where: { email: 'sales@acme-industrial.com' },
    update: {},
    create: {
      name: 'Acme Industrial Supplies',
      code: 'VND-ACME-001',
      contactName: 'Robert Vance',
      email: 'sales@acme-industrial.com',
      phone: '+1-555-0199',
      address: '142 Vance Refrigeration Way, Scranton, PA',
      tenantId: tenant.id,
    },
  });
  console.log(`🏢 Seeded SCM Vendor: ${vendor.name}`);

  // 10. Create Core Products
  const productsDef = [
    { name: 'Steel Pipes 3 inch', sku: 'AP-102', unitPrice: 45.00, quantityInStock: 250, reorderLevel: 50, reorderQuantity: 200 },
    { name: 'Aluminum Rods 10mm', sku: 'AR-204', unitPrice: 28.50, quantityInStock: 180, reorderLevel: 40, reorderQuantity: 100 },
    { name: 'PVC Connectors 2 inch', sku: 'PV-301', unitPrice: 4.20, quantityInStock: 60, reorderLevel: 80, reorderQuantity: 300 },
    { name: 'Copper Tubes 12mm', sku: 'CP-408', unitPrice: 62.00, quantityInStock: 15, reorderLevel: 20, reorderQuantity: 50 },
  ];

  for (const prod of productsDef) {
    const whTarget = prod.sku === 'PV-301' ? dbWarehouses[1] : dbWarehouses[0];
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        name: prod.name,
        sku: prod.sku,
        unitPrice: prod.unitPrice,
        quantityInStock: prod.quantityInStock,
        reorderLevel: prod.reorderLevel,
        reorderQuantity: prod.reorderQuantity,
        warehouseId: whTarget.id,
        tenantId: tenant.id,
      },
    });
  }
  console.log(`🔩 Seeded catalog product definitions.`);

  console.log('✅ ERP Seeding database completed successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
