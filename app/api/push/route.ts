// app/api/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

dayjs.extend(utc);
dayjs.extend(timezone);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // microCMSのWebhookからのリクエストか確認
  const signature = req.headers.get('x-microcms-signature');
  const webhookSecret = process.env.MICROCMS_WEBHOOK_SECRET;

  console.log('=== Webhook Debug Info ===');
  console.log('Signature from header:', signature);
  console.log('Webhook secret exists:', !!webhookSecret);
  console.log('Webhook secret value:', webhookSecret);

  if (!signature || !webhookSecret) {
    console.log('Missing signature or webhook secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Next.js では req.text() で生のボディを取得
  const rawBody = await req.text();
  console.log('Raw body length:', rawBody.length);
  console.log('Raw body preview:', rawBody.substring(0, 500));

  // HMAC-SHA256 で署名を計算 (hexエンコーディングで検証)
  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  console.log('Expected signature (hex):', expectedSignature);
  console.log('Received signature:', signature);
  console.log('Signatures match:', signature === expectedSignature);

  if (signature !== expectedSignature) {
    console.log('Signature verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Signature verification passed');
  const body = JSON.parse(rawBody);
  const newContent = body.contents?.new ?? {};
  const publishValue = newContent.publishValue ?? newContent;
  const eventTitle = publishValue?.eventTitle ?? '新しいイベント';
  const eventDate = publishValue?.eventDate ?? '';
  let eventStartTime = publishValue?.eventStartTime ?? '';
  if (Array.isArray(eventStartTime)) {
    eventStartTime = eventStartTime[0] ?? '';
  }

  console.log('Event data:', { eventTitle, eventDate, eventStartTime, publishValue });

  // 日付と時間を組み合わせて日本時間に変換し、フォーマット
  let formattedDateTime = '';
  try {
    if (eventDate) {
      const startTime = eventStartTime || '';
      let japanTime = null;

      if (eventDate.includes('T')) {
        // ISO形式の日付文字列を日本時間として解釈
        japanTime = dayjs(eventDate).tz('Asia/Tokyo');
        if (japanTime.isValid() && startTime) {
          const [hourStr, minuteStr] = startTime.split(':');
          const hours = parseInt(hourStr || '0', 10);
          const minutes = parseInt(minuteStr || '0', 10);
          if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            japanTime = japanTime.hour(hours).minute(minutes);
          }
        }
      } else {
        // 日付文字列と時間をまとめて日本時間として解釈
        const dateTimeString = startTime ? `${eventDate} ${startTime}` : eventDate;
        japanTime = dayjs.tz(dateTimeString, 'Asia/Tokyo');
      }

      if (japanTime && japanTime.isValid()) {
        formattedDateTime = japanTime.format('MM/DD HH:mm');
      }
    }
  } catch (error) {
    console.log('Date parsing error:', error);
  }

  const notificationBody = formattedDateTime ? `${formattedDateTime} ～ ${eventTitle}` : eventTitle;
  console.log('Final notification body:', notificationBody);

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