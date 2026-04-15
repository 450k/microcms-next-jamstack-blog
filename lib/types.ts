// Event関連の型定義を一元管理

export type EventCategory = {
  id: string;
  name: string;
};

export type EventPlace = {
  id: string;
  courtName: string;
  thumbnail_img: {
    url: string;
    height: number;
    width: number;
  };
};

// イベント一覧表示用の型
export type EventListItem = {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventPlace: EventPlace;
  eventStartTime: string[];
  eventHour: string;
  eventMemberNum: string;
  eventCategory: string[];
  eventCourtNum: string[];
};

// イベント詳細ページ用の型
export type EventDetail = EventListItem & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  eventContent: string;
  eventPrice: number;
  tennisOffUrl: string;
  entryDueDate: string;
};


export type NewsItem = {
  id: string;
  createdAt: string;
  publishedAt: string;
  newsTitle: string;
  newsContent?: string;
  linkTo?: string;
};