// app/api/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // microCMSのWebhookからのリクエストか確認
  const secret = req.headers.get('x-microcms-signature');
  if (secret !== process.env.MICROCMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const eventTitle = body.contents?.new?.publishValue?.eventTitle ?? '新しいイベント';

  // Supabaseから全購読者を取得
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: '購読者がいません' });
  }

  // 全購読者に送信
  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: '🎾 新しいイベントが登録されました',
          body: eventTitle,
        })
      )
    )
  );

  // 無効な購読を削除
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscriptions[i].endpoint);
    }
  }

  return NextResponse.json({ message: `${subscriptions.length}件送信しました` });
}