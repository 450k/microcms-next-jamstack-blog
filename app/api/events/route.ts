import { client } from '@/lib/microcms';
import { NextResponse } from 'next/server';
import type { EventListItem } from '@/lib/types';

export async function GET() {
  try {
    if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }
    
    const data = await client.get({
      endpoint: 'event',
      queries: {
        fields: 'id,eventTitle,eventDate,eventPlace,eventStartTime,eventCategory,eventHour,eventMemberNum,eventCourtNum',
      },
    });
    
    return NextResponse.json(data.contents as EventListItem[]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get events', details: errorMessage },
      { status: 500 }
    );
  }
}
