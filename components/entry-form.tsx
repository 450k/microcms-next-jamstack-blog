// components/entry-form.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  eventId: string;
  eventTitle: string;
  maxMembers: number;
  eventDate: string;
  startTime: string | string[];
};

export function EntryForm({ eventId, eventTitle, maxMembers, eventDate, startTime }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const startTimeStr = Array.isArray(startTime) ? startTime[0] : startTime;

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

