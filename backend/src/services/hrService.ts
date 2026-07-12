import hrRepository from '../repositories/hrRepository';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class HrService {
  // Register new employee profile
  async hireEmployee(
    tenantId: string,
    data: {
      employeeCode: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      departmentId: string;
      designation: string;
      dateOfJoining: string;
      salary: number;
      managerId?: string | null;
    },
    adminUserId?: string
  ) {
    const existingCode = await prisma.employee.findFirst({
      where: { employeeCode: data.employeeCode, tenantId, deletedAt: null },
    });
    if (existingCode) {
      throw new BadRequestError('Employee code already exists');
    }

    const existingEmail = await prisma.employee.findFirst({
      where: { email: data.email, tenantId, deletedAt: null },
    });
    if (existingEmail) {
      throw new BadRequestError('Employee email already registered');
    }

    const employee = await hrRepository.createEmployee(tenantId, {
      ...data,
      dateOfJoining: new Date(data.dateOfJoining),
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        tenantId,
        action: 'HIRE_EMPLOYEE',
        module: 'HR',
        details: `Hired employee: ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`,
      },
    });

    return employee;
  }

  // Update employee profile details
  async updateEmployee(
    tenantId: string,
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      departmentId?: string;
      designation?: string;
      status?: string;
      salary?: number;
      managerId?: string | null;
    },
    adminUserId?: string
  ) {
    const emp = await hrRepository.findEmployeeById(tenantId, id);
    if (!emp) {
      throw new NotFoundError('Employee profile not found');
    }

    const updated = await hrRepository.updateEmployee(tenantId, id, data);

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        tenantId,
        action: 'UPDATE_EMPLOYEE',
        module: 'HR',
        details: `Updated details for employee: ${updated.firstName} ${updated.lastName}`,
      },
    });

    return updated;
  }

  // Soft delete employee profile
  async deleteEmployee(tenantId: string, id: string, adminUserId?: string) {
    const emp = await hrRepository.findEmployeeById(tenantId, id);
    if (!emp) {
      throw new NotFoundError('Employee profile not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'TERMINATED' }
      });

      if (emp.userId) {
        await tx.user.update({
          where: { id: emp.userId },
          data: { deletedAt: new Date(), status: 'INACTIVE' }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          tenantId,
          action: 'DELETE_EMPLOYEE',
          module: 'HR',
          details: `Soft deleted employee: ${emp.firstName} ${emp.lastName}`,
        }
      });
    });
  }

  // CSV Import parser
  async importEmployeesCSV(tenantId: string, csvString: string, adminUserId?: string) {
    const lines = csvString.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      throw new BadRequestError('CSV file is empty or missing headers');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const employeesImported: any[] = [];

    // Begin parsing rows
    await prisma.$transaction(async (tx) => {
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });

        // Basic validations
        if (!row.email || !row.firstname || !row.lastname || !row.employeecode || !row.departmentname) {
          continue; // Skip malformed rows
        }

        // Check duplicate email
        const dup = await tx.employee.findFirst({
          where: { email: row.email, tenantId, deletedAt: null }
        });
        if (dup) continue;

        // Resolve department
        let dept = await tx.department.findFirst({
          where: { name: row.departmentname, tenantId, deletedAt: null }
        });
        if (!dept) {
          dept = await tx.department.create({
            data: { name: row.departmentname, tenantId }
          });
        }

        const emp = await tx.employee.create({
          data: {
            employeeCode: row.employeecode,
            firstName: row.firstname,
            lastName: row.lastname,
            email: row.email,
            phone: row.phone || null,
            departmentId: dept.id,
            designation: row.designation || 'Staff',
            dateOfJoining: row.dateofjoining ? new Date(row.dateofjoining) : new Date(),
            salary: parseFloat(row.salary) || 45000.0,
            tenantId,
            status: 'ACTIVE',
          }
        });

        // Create Default Salary Structure
        await tx.salaryStructure.create({
          data: {
            employeeId: emp.id,
            basicSalary: emp.salary * 0.5,
            allowances: emp.salary * 0.2,
            grossSalary: emp.salary * 0.7,
            bonus: emp.salary * 0.1,
            incentives: emp.salary * 0.2,
            tax: emp.salary * 0.1,
            pf: emp.salary * 0.08,
            professionalTax: emp.salary * 0.02,
            deductions: emp.salary * 0.2,
            netSalary: emp.salary,
            tenantId,
          }
        });

        employeesImported.push(emp);
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          tenantId,
          action: 'IMPORT_EMPLOYEES',
          module: 'HR',
          details: `Imported ${employeesImported.length} employees from CSV upload`,
        }
      });
    });

    return employeesImported;
  }

  // Get leave balances
  async getLeaveBalances(tenantId: string, employeeId: string) {
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        tenantId,
        status: 'APPROVED',
        deletedAt: null,
      }
    });

    const limits: Record<string, number> = {
      ANNUAL: 15,
      SICK: 10,
      CASUAL: 5,
      MATERNITY: 90,
      PATERNITY: 15,
    };

    const taken: Record<string, number> = {
      ANNUAL: 0,
      SICK: 0,
      CASUAL: 0,
      MATERNITY: 0,
      PATERNITY: 0,
    };

    approvedLeaves.forEach(leave => {
      const type = leave.leaveType.toUpperCase();
      const diffTime = Math.abs(leave.endDate.getTime() - leave.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      if (taken[type] !== undefined) {
        taken[type] += diffDays;
      }
    });

    return Object.keys(limits).map(key => ({
      leaveType: key,
      total: limits[key],
      used: taken[key],
      available: Math.max(0, limits[key] - taken[key])
    }));
  }

  // Submit leave request
  async applyLeave(
    tenantId: string,
    data: {
      employeeId: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
    }
  ) {
    const emp = await hrRepository.findEmployeeById(tenantId, data.employeeId);
    if (!emp) {
      throw new NotFoundError('Employee profile not found');
    }

    // Verify leave balances before submitting request
    const diffTime = Math.abs(new Date(data.endDate).getTime() - new Date(data.startDate).getTime());
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const balances = await this.getLeaveBalances(tenantId, data.employeeId);
    const targetBalance = balances.find(b => b.leaveType === data.leaveType.toUpperCase());

    if (targetBalance && targetBalance.available < duration) {
      throw new BadRequestError(`Insufficient leave balance: Requested ${duration} days, but only ${targetBalance.available} days remain.`);
    }

    const leave = await hrRepository.createLeave(tenantId, {
      employeeId: data.employeeId,
      leaveType: data.leaveType.toUpperCase(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
    });

    return leave;
  }

  // Approve or Reject leave requests
  async reviewLeave(tenantId: string, leaveId: string, status: string, approverUserId: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestError('Invalid leave state update value');
    }

    const leave = await prisma.leave.findFirst({ 
      where: { id: leaveId, tenantId, deletedAt: null } 
    });
    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    const updated = await hrRepository.updateLeaveStatus(
      tenantId,
      leaveId,
      status,
      approverUserId
    );

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: approverUserId,
        tenantId,
        action: 'REVIEW_LEAVE',
        module: 'HR',
        details: `Leave request ${status.toLowerCase()} for leave ID: ${leaveId}`,
      },
    });

    return updated;
  }

  // Clock In
  async clockIn(tenantId: string, employeeId: string, adminUserId?: string) {
    const emp = await hrRepository.findEmployeeById(tenantId, employeeId);
    if (!emp) {
      throw new NotFoundError('Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    // Calculate status (e.g. late if past 9:00 AM)
    const clockInTime = new Date();
    const limit = new Date();
    limit.setHours(9, 0, 0, 0); // 9:00 AM limit

    const isLate = clockInTime.getTime() > limit.getTime();
    const status = isLate ? 'LATE' : 'PRESENT';

    const attendance = await hrRepository.logAttendance(tenantId, {
      employeeId,
      date: today,
      clockIn: clockInTime,
      status,
      lateArrival: isLate,
    });

    return attendance;
  }

  // Break triggers
  async toggleBreak(tenantId: string, employeeId: string, type: 'START' | 'END') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { employeeId, date: today, tenantId, deletedAt: null }
    });
    if (!attendance) {
      throw new BadRequestError('No clock in log recorded for today');
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        breakStart: type === 'START' ? new Date() : undefined,
        breakEnd: type === 'END' ? new Date() : undefined,
      }
    });

    return updated;
  }

  // Clock Out
  async clockOut(tenantId: string, employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
        tenantId,
        deletedAt: null,
      },
    });

    if (!attendance) {
      throw new BadRequestError('No clock in log recorded for today');
    }

    const clockOutTime = new Date();
    
    // Calculate working hours
    const diffTime = Math.abs(clockOutTime.getTime() - attendance.clockIn.getTime());
    const workingHours = parseFloat((diffTime / (1000 * 60 * 60)).toFixed(2));
    
    // Calculate overtime (hours worked past 8 hours)
    const overtime = Math.max(0, workingHours - 8);

    // Calculate early exit (before 5:00 PM)
    const exitLimit = new Date();
    exitLimit.setHours(17, 0, 0, 0);
    const earlyExit = clockOutTime.getTime() < exitLimit.getTime();

    const updated = await hrRepository.clockOut(
      tenantId,
      employeeId,
      today,
      clockOutTime,
      workingHours,
      overtime,
      earlyExit
    );

    return updated;
  }
}

export default new HrService();
export const hrService = new HrService();
