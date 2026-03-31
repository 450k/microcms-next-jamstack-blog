// app/api/cron/reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/microcms';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // ✅ Cronからのリクエストか確認
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 明日の日付を取得
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

  // microCMSから明日のイベントを取得
  const data = await client.get({
    endpoint: 'event',
    queries: {
      filters: `eventDate[begins_with]${tomorrowStr}`,
      fields: 'id,eventTitle,eventDate,eventStartTime,eventPlace',
    },
  });

  const events = data.contents;

  if (events.length === 0) {
    return NextResponse.json({ message: '明日のイベントはありません' });
  }

  // 各イベントの参加者を取得してLINE通知
  for (const event of events) {
    const { data: entries } = await supabase
      .from('entries')
      .select('name')
      .eq('event_id', event.id)
      .eq('cancelled', false);

    const memberNames = entries?.map((e) => e.name).join('、') || 'なし';

    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_USER_ID,
        messages: [
          {
            type: 'text',
            text: `【明日のイベントリマインダー】\n📅 ${event.eventTitle}\n🕐 ${event.eventStartTime}\n📍 ${event.eventPlace?.[0]?.courtName}\n👥 参加者：${memberNames}`,
          },
        ],
      }),
    });
  }

  return NextResponse.json({ message: `${events.length}件のリマインダーを送信しました` });
}