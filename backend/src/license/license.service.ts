import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LicenseService {
  constructor(private prisma: PrismaService) {}

  async checkLicense(phoneNumber: string) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: number;
        status: string;
        plan_type: string | null;
        plan_start_date: Date | null;
        plan_end_date: Date | null;
      }>
    >`SELECT id, status, plan_type, plan_start_date, plan_end_date FROM users WHERE phone_number = ${phoneNumber} LIMIT 1`;

    const user = rows[0];
    if (!user) {
      return { status: 'not_found', planType: null, expiresAt: null };
    }

    const needsTrialSeed =
      user.status === 'PENDING' || !user.plan_type || !user.plan_end_date;

    if (needsTrialSeed) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);

      await this.prisma.$executeRaw`
        UPDATE users
        SET status = 'ACTIVE',
            plan_type = 'TRIAL',
            plan_start_date = ${now},
            plan_end_date = ${endDate}
        WHERE id = ${user.id}
      `;

      return {
        status: 'active',
        planType: 'TRIAL',
        planStartDate: now,
        expiresAt: endDate,
      };
    }

    // Auto-expire plans that have passed their end date
    if (user.status === 'ACTIVE' && user.plan_end_date && new Date() > user.plan_end_date) {
      await this.prisma.$executeRaw`
        UPDATE users
        SET status = 'EXPIRED'
        WHERE id = ${user.id}
      `;
      return {
        status: 'expired',
        planType: user.plan_type,
        expiresAt: user.plan_end_date,
      };
    }

    return {
      status: user.status.toLowerCase(),
      planType: user.plan_type,
      planStartDate: user.plan_start_date,
      expiresAt: user.plan_end_date,
    };
  }

  async requestTrial(phoneNumber: string, displayName?: string) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    const existingRows = await this.prisma.$queryRaw<
      Array<{ id: number; status: string; display_name: string | null }>
    >`SELECT id, status, display_name FROM users WHERE phone_number = ${phoneNumber} LIMIT 1`;

    const existing = existingRows[0];

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return {
          success: false,
          message: 'You already have an active plan.',
        };
      }
      await this.prisma.$executeRaw`
        UPDATE users
        SET status = 'ACTIVE',
            plan_type = 'TRIAL',
            plan_start_date = ${now},
            plan_end_date = ${endDate},
            display_name = ${displayName || existing.display_name}
        WHERE id = ${existing.id}
      `;
      return {
        success: true,
        message: 'Trial activated successfully.',
      };
    }

    await this.prisma.user.create({
      data: {
        phoneNumber,
        displayName,
        status: 'ACTIVE',
        planType: 'TRIAL',
        planStartDate: now,
        planEndDate: endDate,
      },
    });

    return { success: true, message: 'Trial activated successfully.' };
  }
}
