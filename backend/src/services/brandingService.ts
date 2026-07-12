import prisma from '../config/db';

export class BrandingService {
  async getBranding(tenantId: string) {
    let brand = await prisma.customBranding.findFirst({
      where: { tenantId },
    });

    if (!brand) {
      brand = await prisma.customBranding.create({
        data: {
          tenantId,
          companyName: 'Amdox Enterprise Solutions',
          logoUrl: '/images/default_logo.png',
          primaryColor: '#6366f1',
          whiteLabel: false,
        },
      });
    }

    let theme = await prisma.themeConfiguration.findFirst({
      where: { tenantId },
    });

    if (!theme) {
      theme = await prisma.themeConfiguration.create({
        data: {
          tenantId,
          sidebarColor: '#0f172a',
          bodyBg: '#020617',
        },
      });
    }

    return { brand, theme };
  }

  async saveBranding(
    tenantId: string,
    data: { companyName: string; primaryColor: string; whiteLabel: boolean }
  ) {
    const info = await this.getBranding(tenantId);

    return prisma.customBranding.update({
      where: { id: info.brand.id },
      data: {
        companyName: data.companyName,
        primaryColor: data.primaryColor,
        whiteLabel: data.whiteLabel,
      },
    });
  }
}

export default new BrandingService();
export const brandingService = new BrandingService();
