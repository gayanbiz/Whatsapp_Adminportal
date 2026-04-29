import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name } = await request.json();

    const rows = await prisma.$queryRaw<
      Array<{ id: number; status: string; display_name: string | null }>
    >`SELECT id, status, display_name FROM users WHERE phone_number = ${phoneNumber} LIMIT 1`;

    const existing = rows[0];

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return NextResponse.json({
          success: false,
          message: 'You already have an active plan.',
        });
      }
      await prisma.$executeRaw`
        UPDATE users
        SET status = 'ACTIVE',
            plan_type = 'TRIAL',
            plan_start_date = ${now},
            plan_end_date = ${endDate},
            display_name = ${name || existing.display_name}
        WHERE id = ${existing.id}
      `;
      return NextResponse.json({
        success: true,
        message: 'Trial activated successfully.',
      });
    }

    await prisma.user.create({
      data: {
        phoneNumber,
        displayName: name,
        status: 'ACTIVE',
        planType: 'TRIAL',
        planStartDate: now,
        planEndDate: endDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trial activated successfully.',
    });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
