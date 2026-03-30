import { client } from '@/lib/microcms';
import { NextResponse } from 'next/server';
import type { EventListItem } from '@/lib/types';

export async function GET() {
  try {
    console.log('[API] GET /api/events - Start');
    console.log('[API] Service Domain:', process.env.MICROCMS_SERVICE_DOMAIN);
    console.log('[API] API Key exists:', !!process.env.MICROCMS_API_KEY);
    
    if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
      console.error('[API] Missing environment variables');
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }
    
    const data = await client.get({
      endpoint: 'event',
      queries: {
        fields: 'id,eventTitle,eventDate,eventPlace,eventStartTime,eventCategory,member,eventHour,eventMemberNum,eventCourtNum,eventCourtSurface',
      },
    });
    
    console.log('[API] Events fetched successfully:', data.contents.length, 'items');
    console.log('[API] First event full:', JSON.stringify(data.contents[0], null, 2));
    console.log('[API] First event keys:', Object.keys(data.contents[0]));
    return NextResponse.json(data.contents as EventListItem[]);
  } catch (error) {
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get events', details: errorMessage },
      { status: 500 }
    );
  }
}
