import prisma from '../config/db';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        employee: true,
        userRoles: {
          where: { deletedAt: null },
          include: { role: true }
        }
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        employee: true,
        userRoles: {
          where: { deletedAt: null },
          include: { role: true }
        }
      },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    tenantId?: string | null;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantId: data.tenantId,
        status: 'ACTIVE',
      },
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      passwordHash?: string;
      firstName?: string;
      lastName?: string;
      status?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async listAll(tenantId?: string) {
    return prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        userRoles: {
          where: { deletedAt: null },
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        userRoles: {
          where: { deletedAt: null },
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });
  }
}

export default new UserRepository();
export const userRepository = new UserRepository();
