'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type Entry = {
  id: string;
  name: string;
  cancelled: boolean;
  created_at: string;
};

export function EntryList({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // 管理者かどうかの状態

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('event_id', eventId)
      .eq('cancelled', false)
      .order('created_at', { ascending: true });
    setEntries(data ?? []);
  };

  const checkAdmin = async () => {
    const res = await fetch('/api/admin/check');
    const { isAdmin } = await res.json();
    setIsAdmin(isAdmin);
  };

  const handleCancel = async (id: string) => {
    await supabase.from('entries').update({ cancelled: true }).eq('id', id);
    fetchEntries();
  };

  useEffect(() => { fetchEntries(); checkAdmin();}, [eventId]);

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-2">
        参加者一覧（{entries.length}名）
      </h3>
      {entries.length === 0 ? (
        <p className="text-gray-500">まだエントリーはありません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-2">
              <span>✅ {entry.name}</span>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(entry.id)}
                >
                  キャンセル
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}