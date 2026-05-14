import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json(
      { message: 'DATABASE_URL is not configured' },
      { status: 500 },
    );
  }

  const ssl = connectionString.includes('localhost')
    ? undefined
    : { rejectUnauthorized: false };

  const client = new Client({
    connectionString,
    ssl,
    application_name: 'supabase-heartbeat',
  });

  try {
    await client.connect();
    const result = await client.query('select now() as now');
    return NextResponse.json({ ok: true, now: result.rows[0]?.now ?? null });
  } catch (error) {
    return NextResponse.json(
      { message: 'Heartbeat failed', error: (error as Error).message },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}
