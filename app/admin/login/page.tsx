// app/admin/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('パスワードが違います');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <LogoutButton />
    </div>
      <h1 className="text-2xl font-bold">管理者ログイン</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        id="password"
        name="password"
        type="password"
        placeholder="パスワードを入力"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded p-2 w-64"
      />
      <Button onClick={handleLogin} className="w-64">
        ログイン
      </Button>
    </div>
  );
}