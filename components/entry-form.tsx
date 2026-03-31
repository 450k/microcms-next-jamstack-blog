'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type Props = {
  eventId: string;
  eventTitle: string;
  maxMembers: number;
  eventDate: string;
  eventStartTime: string | string[];
};

export function EntryForm({ eventId, eventTitle, maxMembers, eventDate, eventStartTime }: Props) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entryCount, setEntryCount] = useState(0);

  // ✅ 現在の参加者数を取得
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('cancelled', false);
      setEntryCount(count || 0);
    };
    fetchCount();
  }, [eventId]);

  const isFull = entryCount >= maxMembers; // ✅ 満員判定

  // Supabase直接ではなくAPI経由に変更
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('お名前を入力してください');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, eventId, eventTitle, eventDate, eventStartTime }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError('エントリーに失敗しました');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <p className="text-green-600 font-semibold">✅ エントリーが完了しました！</p>
    );
  }

  // ✅ 満員の場合はフォームを閉じる
  if (isFull) {
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold">エントリー</h3>
        <p className="text-red-500 font-semibold mt-2">満員御礼！エントリーを締め切りました。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 my-6">
      <h3 className="text-xl font-semibold">エントリー</h3>
      <p className="text-sm text-gray-500">残り{maxMembers - entryCount}名</p>
      {error && <p className="text-red-500">{error}</p>}
      <input
        id="name"
        name="name"
        type="text"
        placeholder="名前を入力"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded p-2"
      />
      <Button onClick={handleSubmit} disabled={loading} className='btn-entry w-min bg-orange-500'>
        {loading ? '送信中...' : 'エントリーする'}
      </Button>
    </div>
  );
}