// app/admin/page.tsx
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { LogoutButton } from '@/components/logout-button';
import { MemberTable, type Member } from '@/components/member-table';
import { DeleteOldEntriesForm } from '@/components/delete-old-entries-form';
import { client } from '@/lib/microcms';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type EventSchedule = { id: string; eventDate: string; eventStartTime?: string[] };

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// エントリーに含まれるイベントの開催日時を microCMS からまとめて取得
async function getEventSchedules(eventIds: string[]): Promise<Map<string, EventSchedule>> {
  const map = new Map<string, EventSchedule>();
  const ids = [...new Set(eventIds.filter(Boolean))];
  for (let i = 0; i < ids.length; i += 100) {
    try {
      const data = await client.getList<EventSchedule>({
        endpoint: 'event',
        queries: { ids: ids.slice(i, i + 100).join(','), fields: 'id,eventDate,eventStartTime', limit: 100 },
      });
      data.contents.forEach((event) => map.set(event.id, event));
    } catch (error) {
      console.error('Failed to fetch event schedules:', error);
    }
  }
  return map;
}

function formatSchedule(event: EventSchedule | undefined) {
  if (!event?.eventDate) return '-';
  const date = dayjs(event.eventDate).tz('Asia/Tokyo');
  return `${date.format('YYYY/MM/DD')}（${WEEKDAYS[date.day()]}）${event.eventStartTime?.[0] ?? ''}`;
}


export default async function AdminPage() {
  // cookies() を参照して常に最新データで描画（動的レンダリング）
  await cookies();

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: members } = await getSupabaseAdmin()
    .from('members')
    .select('line_user_id, display_name, name, status, created_at')
    .order('created_at', { ascending: false })
    .returns<Member[]>();

  // 承認待ちメンバーの申請イベント
  const { data: pendingEntries } = await getSupabaseAdmin()
    .from('pending_entries')
    .select('line_user_id, event_title')
    .order('created_at', { ascending: true });

  const pendingMembers = (members?.filter((m) => m.status === 'pending') ?? []).map((m) => ({
    ...m,
    requested_events: pendingEntries?.filter((p) => p.line_user_id === m.line_user_id).map((p) => p.event_title ?? '-') ?? [],
  }));
  const approvedMembers = members?.filter((m) => m.status === 'approved') ?? [];
  const rejectedMembers = members?.filter((m) => m.status === 'rejected') ?? [];

  const schedules = await getEventSchedules(entries?.map((e) => e.event_id) ?? []);

  const active = entries?.filter((e) => !e.cancelled) ?? [];
  const cancelled = entries?.filter((e) => e.cancelled) ?? [];

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <LogoutButton />
      </div>

      {/* Member Management */}
      <section id="members" className="flex flex-col gap-6 mb-12">
        <h2 className="text-2xl font-bold">メンバー管理</h2>
        <MemberTable title="承認待ち" members={pendingMembers} actions={['approve', 'reject']} showRequests />
        <MemberTable title="登録済み" members={approvedMembers} actions={['delete']} />
        <MemberTable title="却下" members={rejectedMembers} actions={['approve', 'delete']} />
      </section>

      {/* Entry Cleanup */}
      <div className="mb-8">
        <DeleteOldEntriesForm />
      </div>

      <h2 className="text-xl font-semibold mb-4">
        参加中（{active.length}名）
      </h2>
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">名前</th>
            <th className="border p-2 text-left">開催日</th>
            <th className="border p-2 text-left">イベント</th>
            <th className="border p-2 text-left">申込日時</th>
          </tr>
        </thead>
        <tbody>
          {active.map((entry) => (
            <tr key={entry.id}>
              <td className="border p-2">{entry.name}</td>
              <td className="border p-2 whitespace-nowrap">{formatSchedule(schedules.get(entry.event_id))}</td>
              <td className="border p-2">{entry.event_title}</td>
              <td className="border p-2">
                {dayjs(entry.created_at).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-4">
        キャンセル済み（{cancelled.length}名）
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">名前</th>
            <th className="border p-2 text-left">開催日</th>
            <th className="border p-2 text-left">イベント</th>
            <th className="border p-2 text-left">申込日時</th>
          </tr>
        </thead>
        <tbody>
          {cancelled.map((entry) => (
            <tr key={entry.id} className="text-gray-400">
              <td className="border p-2">{entry.name}</td>
              <td className="border p-2 whitespace-nowrap">{formatSchedule(schedules.get(entry.event_id))}</td>
              <td className="border p-2">{entry.event_title}</td>
              <td className="border p-2">
                {dayjs(entry.created_at).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}