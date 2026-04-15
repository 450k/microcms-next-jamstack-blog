// components/entry-form.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
  eventId: string;
  eventTitle: string;
  maxMembers: number;
  eventDate: string;
  startTime: string | string[];
  entryDueDate?: string;
};

export function EntryForm({ eventId, eventTitle, maxMembers, eventDate, startTime, entryDueDate }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [entryCount, setEntryCount] = useState(0);
  const startTimeStr = Array.isArray(startTime) ? startTime[0] : startTime;

  // 締め切り判定
  const isDeadlinePassed = entryDueDate && dayjs().tz('Asia/Tokyo').isAfter(dayjs(entryDueDate).tz('Asia/Tokyo'));

  // 参加者数を取得
  useEffect(() => {
    const fetchEntryCount = async () => {
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('event_id', eventId)
        .eq('cancelled', false);
      setEntryCount(data?.length ?? 0);
    };
    fetchEntryCount();
  }, [eventId]);


  const handleLineLogin = () => {
    if (!name.trim()) {
      setError('お名前を入力してください');
      return;
    }
    // LINEログインページにリダイレクト
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI!,
      state: `${eventId}|${eventTitle}|${name}|${eventDate}|${Array.isArray(startTime) ? startTime[0] : startTime}`,
      scope: 'profile',
    });
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
  };

  const isFull = entryCount >= maxMembers; // ✅ 満員判定
  const isDeadline = isDeadlinePassed; // ✅ 締め切り判定

  if (isFull) {
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold">エントリー</h3>
        <p className="text-red-500 font-semibold mt-2">満員御礼！エントリーを締め切りました。</p>
      </div>
    );
  }

  if (isDeadline) {
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold">エントリー</h3>
        <p className="text-red-500 font-semibold mt-2">募集を締め切りました。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 my-6">
      <h3 className="text-xl font-semibold">エントリー<span className='font-normal text-sm text-red-500'>（※LINEエントリー）</span></h3>
      {error && <p className="text-red-500">{error}</p>}
      <input
        id="name"
        name="name"
        type="text"
        placeholder="名前を入力　テニスオフID、LINE ID可"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded p-2"
      />
      {/* ✅ LINEログインボタン */}
      <Button
        onClick={handleLineLogin}
        className="bg-green-500 hover:bg-green-600 text-white w-2xs h-12"
      >
        LINEでエントリー
      </Button>
    </div>
  );
}

