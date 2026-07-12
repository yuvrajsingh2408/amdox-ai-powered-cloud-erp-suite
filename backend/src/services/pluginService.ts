import prisma from '../config/db';

export class PluginService {
  async getInstalledPlugins(tenantId: string) {
    const count = await prisma.pluginInstallation.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.pluginInstallation.create({
        data: { tenantId, pluginName: 'AI Customer Insights Engine', version: '2.4.0' },
      });
    }
    return prisma.pluginInstallation.findMany({ where: { tenantId } });
  }

  async uninstallPlugin(tenantId: string, id: string) {
    return prisma.pluginInstallation.delete({
      where: { id },
    });
  }
}

export default new PluginService();
export const pluginService = new PluginService();
