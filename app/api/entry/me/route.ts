import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
  }

  const lineUserId = req.cookies.get('line_user_id')?.value;
  if (!lineUserId) {
    return NextResponse.json({ entryIds: [] });
  }

  const { data, error } = await supabase
    .from('entries')
    .select('id')
    .eq('event_id', eventId)
    .eq('line_user_id', lineUserId)
    .eq('cancelled', false);

  if (error) {
    console.error('Failed to fetch my entries:', error);
    return NextResponse.json({ entryIds: [] }, { status: 500 });
  }

  return NextResponse.json({ entryIds: data?.map((entry) => entry.id) ?? [] });
}
