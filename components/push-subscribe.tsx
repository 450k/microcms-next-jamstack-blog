// components/push-subscribe.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function PushSubscribe() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // すでに購読済みか確認
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      });
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Service Workerを登録
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // プッシュ通知の許可を取得
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Supabaseに購読情報を保存
      const key = sub.getKey('p256dh');
      const auth = sub.getKey('auth');
      await supabase.from('push_subscriptions').upsert({
        endpoint: sub.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(key!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(auth!))),
      });

      setSubscribed(true);
    } catch (error) {
      console.error('購読登録に失敗しました:', error);
    }
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (error) {
      console.error('購読解除に失敗しました:', error);
    }
    setLoading(false);
  };

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return <p className="text-sm text-gray-400">このブラウザはプッシュ通知に対応していません</p>;
  }

  return (
    <div className="my-4 text-center">
      {subscribed ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-green-600">✅ プッシュ通知が有効です</span>
          <Button variant="outline" size="sm" onClick={handleUnsubscribe} disabled={loading}>
            通知を解除する
          </Button>
        </div>
      ) : (
        <Button onClick={handleSubscribe} disabled={loading}>
          {loading ? '設定中...' : '🔔 プッシュ通知を受け取る'}
        </Button>
      )}
    </div>
  );
}