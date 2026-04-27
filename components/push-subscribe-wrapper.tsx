// components/push-subscribe-wrapper.tsx
'use client';
import dynamic from 'next/dynamic';

const PushSubscribe = dynamic(
  () => import('@/components/push-subscribe').then(m => m.PushSubscribe),
  { ssr: false }
);

export function PushSubscribeWrapper() {
  return <PushSubscribe />;
}