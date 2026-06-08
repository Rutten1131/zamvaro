import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (isAdmin) {
    return NextResponse.json({ authorized: true });
  }
  return NextResponse.json({ authorized: false }, { status: 401 });
}
