// app/api/auth/line/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=invalid', req.url));
  }

const [eventId, eventTitle, name, eventDate, startTime] = state.split('|');

  const formattedDate = dayjs(eventDate).tz('Asia/Tokyo').format('M/D');

  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI!,
      client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
      client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
    }),
  });
  const tokenData = await tokenRes.json();

  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();
  const lineUserId = profile.userId;

  await supabase.from('entries').insert({
    event_id: eventId,
    event_title: eventTitle,
    name: name,
    line_user_id: lineUserId,
  });

  // ✅ 日本時間の日付を使用
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: process.env.LINE_USER_ID,
      messages: [{
        type: 'text',
        text: `【参加申込】\n名前: ${name}\nイベント: ${formattedDate} ${startTime} ～ ${eventTitle}`,
      }],
    }),
  });

  return NextResponse.redirect(new URL(`/events/${eventId}?entry=success`, req.url));
}