// app/api/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // microCMSのWebhookからのリクエストか確認
  const signature = req.headers.get('x-microcms-signature');
  const webhookSecret = process.env.MICROCMS_WEBHOOK_SECRET;
  const rawBody = await req.text();

  console.log('Webhook received:', {
    signature,
    webhookSecret: webhookSecret ? '***' : 'not set',
    rawBodyLength: rawBody.length,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (!signature || !webhookSecret) {
    console.log('Missing signature or webhook secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('base64');

  console.log('Signature check:', {
    received: signature,
    expected: expectedSignature,
    matches: signature === expectedSignature
  });

  if (signature !== webhookSecret && signature !== expectedSignature) {
    console.log('Signature verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const eventTitle = body.contents?.new?.publishValue?.eventTitle ?? '新しいイベント';
  const eventDate = body.contents?.new?.publishValue?.eventDate ?? '';
  const eventStartTime = body.contents?.new?.publishValue?.eventStartTime ?? '';
  const notificationBody = [eventDate, eventStartTime, eventTitle].filter(Boolean).join(' ');

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
          body: notificationBody,
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