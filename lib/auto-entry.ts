import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { client } from '@/lib/microcms';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { pushToAdmin } from '@/lib/line';
import type { EventDetail } from '@/lib/types';

dayjs.extend(utc);
dayjs.extend(timezone);

type PendingEntry = {
  event_id: string;
  event_title: string | null;
  name: string;
};

// 承認されたメンバーの申請中エントリーを entries に登録する
// 満員・締切・開催日を過ぎたものは登録せず、管理者に通知する
export async function processPendingEntries(lineUserId: string) {
  const supabase = getSupabaseAdmin();

  const { data: pending, error } = await supabase
    .from('pending_entries')
    .select('event_id, event_title, name')
    .eq('line_user_id', lineUserId)
    .returns<PendingEntry[]>();

  if (error) {
    console.error('Failed to load pending entries:', error);
    return;
  }

  for (const request of pending ?? []) {
    const result = await registerEntry(lineUserId, request);
    await pushToAdmin(result);
  }

  await supabase.from('pending_entries').delete().eq('line_user_id', lineUserId);
}

async function registerEntry(lineUserId: string, request: PendingEntry): Promise<string> {
  const supabase = getSupabaseAdmin();
  const label = `名前: ${request.name}\nイベント: ${request.event_title ?? request.event_id}`;

  let event: EventDetail;
  try {
    event = await client.get({ endpoint: 'event', contentId: request.event_id });
  } catch (error) {
    console.error('Failed to fetch event for auto entry:', error);
    return `【自動エントリー不可】\n${label}\n理由: イベントが見つかりません`;
  }

  const eventLabel = `名前: ${request.name}\nイベント: ${dayjs(event.eventDate).tz('Asia/Tokyo').format('M/D')} ${event.eventStartTime?.[0] ?? ''} ～ ${event.eventTitle}`;
  const now = dayjs().tz('Asia/Tokyo');

  if (event.entryDueDate && now.isAfter(dayjs(event.entryDueDate))) {
    return `【自動エントリー不可】\n${eventLabel}\n理由: 募集期限を過ぎています`;
  }
  if (dayjs(event.eventDate).tz('Asia/Tokyo').endOf('day').isBefore(now)) {
    return `【自動エントリー不可】\n${eventLabel}\n理由: 開催日を過ぎています`;
  }

  // すでに同じLINEアカウント、または同じ名前でエントリー済みならスキップ
  const activeEntries = () =>
    supabase.from('entries').select('id').eq('event_id', request.event_id).eq('cancelled', false).limit(1);
  const [{ data: byLineUser }, { data: byName }] = await Promise.all([
    activeEntries().eq('line_user_id', lineUserId),
    activeEntries().eq('name', request.name),
  ]);
  if (byLineUser?.length || byName?.length) {
    return `【自動エントリー済み】\n${eventLabel}\n（すでにエントリーされています）`;
  }

  const { count } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', request.event_id)
    .eq('cancelled', false);
  if ((count ?? 0) >= Number(event.eventMemberNum)) {
    return `【自動エントリー不可】\n${eventLabel}\n理由: 満員です`;
  }

  const { error } = await supabase.from('entries').insert({
    event_id: request.event_id,
    event_title: event.eventTitle,
    name: request.name,
    line_user_id: lineUserId,
  });

  // 23505: 一意制約違反（同時に登録済み）
  if (error && error.code !== '23505') {
    console.error('Failed to insert auto entry:', error);
    return `【自動エントリー失敗】\n${eventLabel}\n理由: 登録エラー`;
  }

  return `【参加申込（承認時に自動登録）】\n${eventLabel}`;
}
