import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { entryId } = await req.json();
  if (!entryId) {
    return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
  }

  const lineUserId = req.cookies.get('line_user_id')?.value;
  if (!lineUserId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { error, data } = await supabase
    .from('entries')
    .update({ cancelled: true })
    .eq('id', entryId)
    .eq('line_user_id', lineUserId)
    .eq('cancelled', false)
    .select('id');

  if (error) {
    console.error('Entry cancel failed:', error);
    return NextResponse.json({ error: 'キャンセルに失敗しました' }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ error: '該当するエントリーがありません' }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
