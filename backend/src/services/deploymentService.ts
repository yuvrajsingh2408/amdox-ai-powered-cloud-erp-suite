import prisma from '../config/db';

export class DeploymentService {
  async getVersions() {
    const count = await prisma.applicationVersion.count();
    if (count === 0) {
      await prisma.applicationVersion.createMany({
        data: [
          { version: 'v3.8.4', description: 'Enterprise security compliance matrices patch release.', releaseDate: new Date(), isActive: true },
          { version: 'v3.8.0', description: 'Core workflow automation rules engine integration.', releaseDate: new Date(Date.now() - 2592000000), isActive: false },
        ],
      });
    }
    return prisma.applicationVersion.findMany({
      orderBy: { releaseDate: 'desc' },
    });
  }

  async getMigrations(tenantId: string) {
    const count = await prisma.migrationHistory.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.migrationHistory.create({
        data: { tenantId, migration: '20260710190000_add_security_mfa_tables' },
      });
    }
    return prisma.migrationHistory.findMany({
      where: { tenantId },
      orderBy: { appliedAt: 'desc' },
    });
  }
}

export default new DeploymentService();
export const deploymentService = new DeploymentService();
