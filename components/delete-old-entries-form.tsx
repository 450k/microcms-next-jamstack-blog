'use client';

import { useActionState, useState } from 'react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { deleteOldEntries } from '@/app/admin/actions';

export function DeleteOldEntriesForm() {
  const [state, formAction, isPending] = useActionState(deleteOldEntries, null);
  // 初期値: 1か月前
  const [before, setBefore] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
  const [target, setTarget] = useState<'all' | 'cancelled'>('all');

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const label = target === 'cancelled' ? 'キャンセル済みのエントリー' : 'すべてのエントリー（参加中・キャンセル済み）';
        const message = `${dayjs(before).format('YYYY/MM/DD')} より前に申し込まれた${label}を削除します。\nこの操作は元に戻せません。よろしいですか？`;
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50"
    >
      <h3 className="m-0 text-lg font-semibold">古いエントリーの一括削除</h3>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span>申込日が</span>
          <input type="date" name="before" value={before} onChange={(e) => setBefore(e.target.value)} required className="p-1 border rounded bg-white" />
          <span>より前</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="target" value="all" checked={target === 'all'} onChange={() => setTarget('all')} />
          <span>すべて</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="target" value="cancelled" checked={target === 'cancelled'} onChange={() => setTarget('cancelled')} />
          <span>キャンセル済みのみ</span>
        </label>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? '削除中...' : '削除する'}
        </Button>
      </div>
      {state && <p className={`m-0 text-sm ${state.error ? 'text-red-600' : 'text-green-700'}`}>{state.message}</p>}
    </form>
  );
}
