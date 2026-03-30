// app/admin/page.tsx
import { supabase } from '@/lib/supabase';
import { LogoutButton } from '@/components/logout-button';

export default async function AdminPage() {
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  const active = entries?.filter((e) => !e.cancelled) ?? [];
  const cancelled = entries?.filter((e) => e.cancelled) ?? [];

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <LogoutButton />
      </div>

      <h2 className="text-xl font-semibold mb-4">
        参加中（{active.length}名）
      </h2>
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">名前</th>
            <th className="border p-2 text-left">イベント</th>
            <th className="border p-2 text-left">申込日時</th>
          </tr>
        </thead>
        <tbody>
          {active.map((entry) => (
            <tr key={entry.id}>
              <td className="border p-2">{entry.name}</td>
              <td className="border p-2">{entry.event_title}</td>
              <td className="border p-2">
                {new Date(entry.created_at).toLocaleString('ja-JP')}
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
            <th className="border p-2 text-left">イベント</th>
            <th className="border p-2 text-left">申込日時</th>
          </tr>
        </thead>
        <tbody>
          {cancelled.map((entry) => (
            <tr key={entry.id} className="text-gray-400">
              <td className="border p-2">{entry.name}</td>
              <td className="border p-2">{entry.event_title}</td>
              <td className="border p-2">
                {new Date(entry.created_at).toLocaleString('ja-JP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}