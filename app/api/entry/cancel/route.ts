import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { entryId } = await req.json();
  if (!entryId) {
    return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
  }

  const lineUserId = req.cookies.get('line_user_id')?.value;
  const adminToken = req.cookies.get('admin_token')?.value;
  const isAdmin = adminToken === process.env.ADMIN_PASSWORD;

  if (!isAdmin && !lineUserId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const query = supabase
    .from('entries')
    .update({ cancelled: true })
    .eq('id', entryId)
    .eq('cancelled', false);

  const { error, data } = isAdmin
    ? await query.select('id')
    : await query.eq('line_user_id', lineUserId).select('id');

  if (error) {
    console.error('Entry cancel failed:', error);
    return NextResponse.json({ error: 'キャンセルに失敗しました' }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ error: '該当するエントリーがありません' }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
