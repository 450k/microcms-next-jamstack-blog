// components/logout-button.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}