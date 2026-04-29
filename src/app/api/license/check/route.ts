import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    const rows = await prisma.$queryRaw<
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
      return NextResponse.json({
        status: 'not_found',
        planType: null,
        expiresAt: null,
      });
    }

    const needsTrialSeed =
      user.status === 'PENDING' || !user.plan_type || !user.plan_end_date;

    if (needsTrialSeed) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);

      await prisma.$executeRaw`
        UPDATE users
        SET status = 'ACTIVE',
            plan_type = 'TRIAL',
            plan_start_date = ${now},
            plan_end_date = ${endDate}
        WHERE id = ${user.id}
      `;

      return NextResponse.json({
        status: 'active',
        planType: 'TRIAL',
        planStartDate: now,
        expiresAt: endDate,
      });
    }

    // Auto-expire plans that have passed their end date
    if (user.status === 'ACTIVE' && user.plan_end_date && new Date() > user.plan_end_date) {
      await prisma.$executeRaw`
        UPDATE users
        SET status = 'EXPIRED'
        WHERE id = ${user.id}
      `;
      return NextResponse.json({
        status: 'expired',
        planType: user.plan_type,
        expiresAt: user.plan_end_date,
      });
    }

    return NextResponse.json({
      status: user.status.toLowerCase(),
      planType: user.plan_type,
      planStartDate: user.plan_start_date,
      expiresAt: user.plan_end_date,
    });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
