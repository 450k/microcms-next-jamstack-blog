'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

async function assertAdmin() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    throw new Error('Unauthorized');
  }
}

function getLineUserId(formData: FormData) {
  const lineUserId = formData.get('lineUserId');
  if (typeof lineUserId !== 'string' || !lineUserId) {
    throw new Error('lineUserId is required');
  }
  return lineUserId;
}

async function updateStatus(formData: FormData, status: 'approved' | 'rejected') {
  await assertAdmin();
  const { error } = await getSupabaseAdmin()
    .from('members')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('line_user_id', getLineUserId(formData));

  if (error) {
    console.error(`Failed to set member status to ${status}:`, error);
    throw new Error('メンバーの更新に失敗しました');
  }
  revalidatePath('/admin');
}

export async function approveMember(formData: FormData) {
  await updateStatus(formData, 'approved');
}

export async function rejectMember(formData: FormData) {
  await updateStatus(formData, 'rejected');
}

// 削除すると、次回LINEエントリー時に再び「承認待ち」になる
export async function deleteMember(formData: FormData) {
  await assertAdmin();
  const { error } = await getSupabaseAdmin()
    .from('members')
    .delete()
    .eq('line_user_id', getLineUserId(formData));

  if (error) {
    console.error('Failed to delete member:', error);
    throw new Error('メンバーの削除に失敗しました');
  }
  revalidatePath('/admin');
}

export type DeleteEntriesState = { message: string; error?: boolean } | null;

// 指定日（日本時間）より前に申し込まれたエントリーをまとめて削除
export async function deleteOldEntries(
  _prev: DeleteEntriesState,
  formData: FormData
): Promise<DeleteEntriesState> {
  await assertAdmin();

  const before = formData.get('before');
  const target = formData.get('target');
  if (typeof before !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(before)) {
    return { message: '日付を指定してください', error: true };
  }

  // 日本時間のその日の 00:00 を境界にする
  const boundary = new Date(`${before}T00:00:00+09:00`).toISOString();

  let query = getSupabaseAdmin().from('entries').delete({ count: 'exact' }).lt('created_at', boundary);
  if (target === 'cancelled') {
    query = query.eq('cancelled', true);
  }

  const { error, count } = await query;
  if (error) {
    console.error('Failed to delete old entries:', error);
    return { message: '削除に失敗しました', error: true };
  }

  revalidatePath('/admin');
  return { message: `${count ?? 0}件のエントリーを削除しました` };
}
