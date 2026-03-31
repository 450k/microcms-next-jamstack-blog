// app/api/entry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { name, eventId, eventTitle, eventDate, eventStartTime } = await req.json();

  // Supabaseにエントリーを保存
  const { error } = await supabase.from('entries').insert({
    event_id: eventId,
    event_title: eventTitle,
    name: name.trim(),
  });

  if (error) {
    return NextResponse.json({ error: 'エントリーに失敗しました' }, { status: 500 });
  }

  // LINE通知を送信
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };
  
  const startTime = Array.isArray(eventStartTime) ? eventStartTime[0] : eventStartTime;

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
          text: `【参加申込】\n開催日: ${formatDate(eventDate)}\n開催時間: ${startTime}\nイベント: ${eventTitle}`,
        },
      ],
    }),
  });


  return NextResponse.json({ success: true });
}