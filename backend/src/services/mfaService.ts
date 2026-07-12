import prisma from '../config/db';
import logger from '../utils/logger';
import crypto from 'crypto';
import { NotFoundError } from '../utils/errors';

export class MfaService {
  async generateMfaSecret(tenantId: string, userId: string) {
    const secret = crypto.randomBytes(20).toString('hex');
    const qrCodePlaceholder = `otpauth://totp/AmdoxERP:${userId}?secret=${secret}&issuer=AmdoxERP`;

    // Write placeholder recovery codes
    const recoveryCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
    
    await prisma.$transaction(async (tx) => {
      // Clean previous codes
      await tx.mFARecoveryCode.deleteMany({ where: { tenantId, userId } });

      const hashPromises = recoveryCodes.map((code) => {
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        return tx.mFARecoveryCode.create({
          data: {
            tenantId,
            userId,
            codeHash: hash,
          },
        });
      });

      await Promise.all(hashPromises);
    });

    return {
      secret,
      qrCodeUrl: qrCodePlaceholder,
      recoveryCodes,
    };
  }

  async verifyAndEnableMfa(tenantId: string, userId: string, token: string) {
    // TOTP mock verification (accept any 6 digit numeric code for simulation)
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return true;
  }

  async disableMfa(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
  }
}

export default new MfaService();
export const mfaService = new MfaService();
