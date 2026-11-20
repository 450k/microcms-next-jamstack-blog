// app/api/auth/line/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getPostHogClient } from '@/lib/posthog-server';
import { pushToAdmin } from '@/lib/line';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 承認待ちの間に申し込んだイベントを保存（承認時に自動エントリー）
async function savePendingEntry(lineUserId: string, eventId: string, eventTitle: string, name: string) {
  const { error } = await getSupabaseAdmin()
    .from('pending_entries')
    .upsert(
      { line_user_id: lineUserId, event_id: eventId, event_title: eventTitle, name },
      { onConflict: 'line_user_id,event_id' }
    );
  if (error) console.error('Failed to save pending entry:', error);
  return !error;
}

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
  const lineUserId: string | undefined = profile.userId;
  const displayName: string | undefined = profile.displayName;

  if (!lineUserId) {
    console.error('Failed to get LINE profile:', profile);
    return NextResponse.redirect(new URL(`/events/${eventId}?entry=error`, req.url));
  }

  const normalizedName = name.trim();

  // ✅ 登録メンバーかどうかを確認
  const { data: member, error: memberError } = await getSupabaseAdmin()
    .from('members')
    .select('status')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (memberError) {
    console.error('Failed to check member:', memberError);
    return NextResponse.redirect(new URL(`/events/${eventId}?entry=error`, req.url));
  }

  if (!member) {
    // 未登録 → 承認待ちとして登録し、管理者に通知
    const { error: requestError } = await getSupabaseAdmin().from('members').insert({
      line_user_id: lineUserId,
      display_name: displayName ?? null,
      name: normalizedName,
      status: 'pending',
    });

    if (requestError) {
      console.error('Failed to create member request:', requestError);
      return NextResponse.redirect(new URL(`/events/${eventId}?entry=error`, req.url));
    }

    if (!(await savePendingEntry(lineUserId, eventId, eventTitle, normalizedName))) {
      return NextResponse.redirect(new URL(`/events/${eventId}?entry=error`, req.url));
    }

    await pushToAdmin(
      `【メンバー申請】\n名前: ${normalizedName}\nLINE名: ${displayName ?? '-'}\nイベント: ${formattedDate} ${startTime} ～ ${eventTitle}\n管理画面で承認してください。`
    );

    return NextResponse.redirect(new URL(`/events/${eventId}?entry=pending`, req.url));
  }

  if (member.status === 'rejected') {
    return NextResponse.redirect(new URL(`/events/${eventId}?entry=rejected`, req.url));
  }

  if (member.status !== 'approved') {
    // 承認待ち中に別のイベントにも申し込んだ場合も保存しておく
    if (!(await savePendingEntry(lineUserId, eventId, eventTitle, normalizedName))) {
      return NextResponse.redirect(new URL(`/events/${eventId}?entry=error`, req.url));
    }
    return NextResponse.redirect(new URL(`/events/${eventId}?entry=pending`, req.url));
  }

  const { data: existingEntries, error: existingError } = await supabase
    .from('entries')
    .select('id')
    .eq('event_id', eventId)
    .eq('cancelled', false)
    .eq('line_user_id', lineUserId)
    .limit(1);

  if (existingError) {
    console.error('Failed to check existing entry:', existingError);
    return NextResponse.redirect(new URL('/?error=entry-check-failed', req.url));
  }

  if (!existingEntries?.length) {
    const { data: existingNameEntries, error: existingNameError } = await supabase
      .from('entries')
      .select('id')
      .eq('event_id', eventId)
      .eq('cancelled', false)
      .eq('name', normalizedName)
      .limit(1);

    if (existingNameError) {
      console.error('Failed to check existing name entry:', existingNameError);
      return NextResponse.redirect(new URL('/?error=entry-check-failed', req.url));
    }

    if (!existingNameEntries?.length) {
      const { error: upsertError } = await supabase.from('entries').upsert(
        {
          event_id: eventId,
          event_title: eventTitle,
          name: normalizedName,
          line_user_id: lineUserId,
        },
        {
          onConflict: 'event_id,line_user_id',
          ignoreDuplicates: true,
        }
      );

      if (upsertError) {
        console.error('Failed to upsert entry:', upsertError);

        const { data: recheckEntries, error: recheckError } = await supabase
          .from('entries')
          .select('id')
          .eq('event_id', eventId)
          .eq('cancelled', false)
          .eq('line_user_id', lineUserId)
          .limit(1);

        if (recheckError) {
          console.error('Failed to recheck entry after upsert error:', recheckError);
          return NextResponse.redirect(new URL('/?error=entry-insert-failed', req.url));
        }

        if (!recheckEntries?.length) {
          const { error: insertError } = await supabase.from('entries').insert({
            event_id: eventId,
            event_title: eventTitle,
            name: normalizedName,
            line_user_id: lineUserId,
          });

          if (insertError) {
            console.error('Failed to insert entry:', insertError);
            return NextResponse.redirect(new URL('/?error=entry-insert-failed', req.url));
          }
        }
      }
    }
  }

  const posthog = getPostHogClient();
  posthog.identify({
    distinctId: lineUserId,
    properties: { name, line_user_id: lineUserId },
  });
  posthog.capture({
    distinctId: lineUserId,
    event: 'entry_completed',
    properties: {
      event_id: eventId,
      event_title: eventTitle,
      event_date: eventDate,
      start_time: startTime,
      participant_name: name,
    },
  });

  // ✅ 日本時間の日付を使用
  await pushToAdmin(`【参加申込】\n名前: ${name}\nイベント: ${formattedDate} ${startTime} ～ ${eventTitle}`);

  const response = NextResponse.redirect(new URL(`/events/${eventId}?entry=success`, req.url));
  response.cookies.set('line_user_id', lineUserId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}