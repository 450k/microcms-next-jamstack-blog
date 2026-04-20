// app/api/cron/reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/microcms';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ 日本時間で明日の日付を取得
  const tomorrowStr = dayjs().tz('Asia/Tokyo').add(1, 'day').format('YYYY-MM-DD');

  const data = await client.get({
    endpoint: 'event',
    queries: {
      filters: `eventDate[begins_with]${tomorrowStr}`,
      fields: 'id,eventTitle,eventDate,eventStartTime,eventPlace',
    },
  });

  for (const event of data.contents) {
    // ✅ 日本時間に変換
    const formattedDate = dayjs(event.eventDate).tz('Asia/Tokyo').format('M/D');
    const startTime = Array.isArray(event.eventStartTime)
      ? event.eventStartTime[0]
      : event.eventStartTime;

    const { data: entries } = await supabase
      .from('entries')
      .select('name, line_user_id')
      .eq('event_id', event.id)
      .eq('cancelled', false);

    if (!entries || entries.length === 0) continue;

    for (const entry of entries) {
      if (!entry.line_user_id) continue;

      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: entry.line_user_id,
          messages: [
            {
              type: 'text',
              // ✅ 日本時間の日付を使用
              text: `【リマインダー】\n${entry.name}さん、今週の練習会をお忘れなく！雨天の場合は1時間前までにお知らせします。\n\n📅 ${formattedDate} ${startTime} ${event.eventTitle}\n📍 ${event.eventPlace.courtName}`,
            },
          ],
        }),
      });
    }
  }

  return NextResponse.json({ message: 'リマインダーを送信しました' });
}