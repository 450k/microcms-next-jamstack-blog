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
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelError, setCancelError] = useState('');

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

  const [myEntryIds, setMyEntryIds] = useState<string[]>([]);

  const fetchMyEntryIds = async () => {
    const res = await fetch(`/api/entry/me?eventId=${encodeURIComponent(eventId)}`);
    if (res.ok) {
      const data = await res.json();
      setMyEntryIds(data.entryIds ?? []);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelError('');
    setCancelSuccess('');

    if (!confirm('本当にキャンセルしてもよろしいですか？')) {
      return;
    }

    const res = await fetch('/api/entry/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: id }),
    });

    if (!res.ok) {
      const data = await res.json();
      setCancelError(data.error || 'キャンセルに失敗しました');
      return;
    }

    setCancelSuccess('キャンセルが完了しました。');
    await fetchEntries();
    await fetchMyEntryIds();
  };

  useEffect(() => {
    if (!cancelSuccess) return;
    const timer = setTimeout(() => setCancelSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [cancelSuccess]);

  useEffect(() => {
    fetchEntries();
    checkAdmin();
    fetchMyEntryIds();
  }, [eventId]);

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-2">
        参加者一覧（{entries.length}名）
      </h3>
      {cancelSuccess && <p className="text-sm text-green-700 mb-2">{cancelSuccess}</p>}
      {cancelError && <p className="text-sm text-red-500 mb-2">{cancelError}</p>}
      {entries.length === 0 ? (
        <p className="text-gray-500">まだエントリーはありません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-2">
              <span>✅ {entry.name}</span>
              <div className="flex items-center gap-2">
                {myEntryIds.includes(entry.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(entry.id)}
                  >
                    キャンセル
                  </Button>
                )}
                {isAdmin && !myEntryIds.includes(entry.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(entry.id)}
                  >
                    キャンセル
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}