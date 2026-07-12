import prisma from '../config/db';

export class HrRepository {
  // --- Employee operations ---
  async findEmployeeById(tenantId: string, id: string) {
    return prisma.employee.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { 
        department: true, 
        salaryStructure: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            designation: true,
          }
        }
      },
    });
  }

  async listAllEmployees(tenantId: string) {
    return prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      include: { department: true },
      orderBy: { employeeCode: 'asc' },
    });
  }

  async createEmployee(
    tenantId: string,
    data: {
      userId?: string | null;
      employeeCode: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      departmentId: string;
      designation: string;
      dateOfJoining: Date;
      salary: number;
      managerId?: string | null;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({
        data: {
          userId: data.userId || null,
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          departmentId: data.departmentId,
          designation: data.designation,
          dateOfJoining: data.dateOfJoining,
          salary: data.salary,
          managerId: data.managerId || null,
          tenantId,
        },
      });

      // Create default salary structure automatically
      await tx.salaryStructure.create({
        data: {
          employeeId: emp.id,
          basicSalary: data.salary * 0.5,       // 50% basic
          allowances: data.salary * 0.2,        // 20% allowance
          grossSalary: data.salary * 0.7,       // 70% gross basic + allowance
          bonus: data.salary * 0.1,             // 10% bonus
          incentives: data.salary * 0.2,        // 20% incentive
          tax: data.salary * 0.1,               // 10% income tax
          pf: data.salary * 0.08,               // 8% PF
          professionalTax: data.salary * 0.02,  // 2% PT
          deductions: data.salary * 0.2,        // 20% total deductions (Tax + PF + PT)
          netSalary: data.salary,               // Net Salary
          tenantId,
        },
      });

      return emp;
    });
  }

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
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const emp = await tx.employee.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          departmentId: data.departmentId,
          designation: data.designation,
          status: data.status,
          salary: data.salary,
          managerId: data.managerId,
        }
      });

      // If salary is updated, update the salary structure accordingly
      if (data.salary) {
        const s = data.salary;
        await tx.salaryStructure.upsert({
          where: { employeeId: id },
          update: {
            basicSalary: s * 0.5,
            allowances: s * 0.2,
            grossSalary: s * 0.7,
            bonus: s * 0.1,
            incentives: s * 0.2,
            tax: s * 0.1,
            pf: s * 0.08,
            professionalTax: s * 0.02,
            deductions: s * 0.2,
            netSalary: s,
          },
          create: {
            employeeId: id,
            basicSalary: s * 0.5,
            allowances: s * 0.2,
            grossSalary: s * 0.7,
            bonus: s * 0.1,
            incentives: s * 0.2,
            tax: s * 0.1,
            pf: s * 0.08,
            professionalTax: s * 0.02,
            deductions: s * 0.2,
            netSalary: s,
            tenantId,
          }
        });
      }

      return emp;
    });
  }

  // --- Leave operations ---
  async listAllLeaves(tenantId: string) {
    return prisma.leave.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        employee: {
          select: { firstName: true, lastName: true, designation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeave(
    tenantId: string,
    data: {
      employeeId: string;
      leaveType: string;
      startDate: Date;
      endDate: Date;
      reason: string;
    }
  ) {
    return prisma.leave.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateLeaveStatus(tenantId: string, id: string, status: string, approvedById?: string) {
    return prisma.leave.update({
      where: { id },
      data: { status, approvedById },
    });
  }

  // --- Attendance operations ---
  async logAttendance(
    tenantId: string,
    data: {
      employeeId: string;
      date: Date;
      clockIn: Date;
      status: string;
      lateArrival: boolean;
    }
  ) {
    return prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: data.date,
        },
      },
      update: {
        clockIn: data.clockIn,
        status: data.status,
        lateArrival: data.lateArrival,
      },
      create: {
        ...data,
        tenantId,
      },
    });
  }

  async clockOut(tenantId: string, employeeId: string, date: Date, clockOut: Date, workingHours: number, overtime: number, earlyExit: boolean) {
    return prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date,
        },
      },
      data: {
        clockOut,
        workingHours,
        overtime,
        earlyExit,
      },
    });
  }
}

export default new HrRepository();
export const hrRepository = new HrRepository();
