import { client } from '@/lib/microcms';
import { NextResponse } from 'next/server';

type EventPlace = {
  id: string;
  courtName: string;
  thumbnail_img: {
    url: string;
    height: number;
    width: number;
  };
};

type EventCategory = {
  id: string;
  name: string;
};

type Event = {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventPlace: EventPlace[];
  eventStartTime: string;
  eventHour: string;
  eventMemberNum: string;
  member: string[];
  eventCategory: EventCategory;
  eventCourtNum: string;
  eventCourtSurface: string;
};

export async function GET() {
  try {
    console.log('API: Fetching events from microCMS...');
    console.log('Service Domain:', process.env.MICROCMS_SERVICE_DOMAIN);
    
    const data = await client.get({
      endpoint: 'event',
      queries: {
        fields: 'id,eventTitle,eventDate,eventPlace,eventStartTime,eventCategory,member,eventHour,eventMemberNum,eventCourtNum,eventCourtSurface',
      },
    });
    
    console.log('API: Events fetched successfully:', data.contents.length, 'items');
    return NextResponse.json(data.contents as Event[]);
  } catch (error) {
    console.error('API: Failed to get events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to get events', details: errorMessage }, { status: 500 });
  }
}
