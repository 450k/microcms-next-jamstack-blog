'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type Props = {
  eventId: string;
  eventTitle: string;
};

export function EntryForm({ eventId, eventTitle }: Props) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('お名前を入力してください');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.from('entries').insert({
      event_id: eventId,
      event_title: eventTitle,
      name: name.trim(),
    });
    if (error) {
      setError('エントリーに失敗しました');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) return (
    <p className="text-green-600 font-semibold">✅ エントリーが完了しました！</p>
  );

  return (
    <div className="flex flex-col gap-3 my-6">
      <h3 className="text-xl font-semibold">エントリー</h3>
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