// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const isLoginPage = req.nextUrl.pathname === '/admin/login';

  // ✅ ログインページは認証不要
  if (isLoginPage) {
    return NextResponse.next();
  }

  if (token === process.env.ADMIN_PASSWORD) {
    return NextResponse.next(); // ✅ 認証済み
  }

  // 未認証の場合はログインページへ
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};