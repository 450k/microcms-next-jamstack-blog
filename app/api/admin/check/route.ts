// app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const isAdmin = token === process.env.ADMIN_PASSWORD;
  return NextResponse.json({ isAdmin });
}