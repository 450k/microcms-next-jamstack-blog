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
    const data = await client.get({
      endpoint: 'event',
      queries: {
        fields: 'id,eventTitle,eventDate,eventPlace,eventStartTime,eventCategory,member,eventHour,eventMemberNum,eventCourtNum,eventCourtSurface',
      },
    });
    return NextResponse.json(data.contents as Event[]);
  } catch (error) {
    console.error('failed to get events:', error);
    return NextResponse.json({ error: 'Failed to get events' }, { status: 500 });
  }
}
