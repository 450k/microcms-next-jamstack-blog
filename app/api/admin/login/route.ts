// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPostHogClient } from '@/lib/posthog-server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: 'admin',
    event: 'admin_logged_in',
    properties: { source: 'api' },
  });

  const res = NextResponse.json({ success: true });

  // ✅ 認証済みクッキーをセット
  res.cookies.set('admin_token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24時間
    path: '/',
  });

  return res;
}