import Link from 'next/link';
import { client } from '../lib/microcms';
import { formatDate,formatDay,formatDateShort } from "@/lib/utils";

// shad cn のパーツをインポート
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

// ブログ記事の型定義
type Props = {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventPlace: EventPlace[];
  eventStartTime: string;
  eventHour: string;
  eventMemberNum: string;
  member: string[];
  eventCategory:  EventCategory;
  eventCourtNum: string;
  eventCourtSurface: string;
};


// microCMSからブログ記事を取得
async function getBlogPosts(): Promise<Props[]> {
  const data = await client.get({
    endpoint: 'event', // 'blog'はmicroCMSのエンドポイント名
    queries: {
      fields: 'id,eventTitle,eventDate,eventPlace,eventStartTime,eventCategory,member,eventHour,eventMemberNum,eventCourtNum,eventCourtSurface',  
    },
  });
  return data.contents;
}

export async function Eventcard() {
    const posts = await getBlogPosts();

    return (
        <div className='container-event'>
            {posts.map((post) => {
                return (
                        <Card key={post.id} className="relative mx-auto w-full max-w-sm pt-0 flex card-item">
                            <div className="absolute inset-0 z-30 aspect-video" />
                            <img
                                src={post.eventPlace[0]?.thumbnail_img.url}
                                alt="Event cover"
                                className="relative z-20 aspect-video w-full object-cover dark:brightness-40"
                            />
                            <CardHeader>
                                <CardAction>
                                    <Badge variant="secondary">{post.eventCategory?.name}</Badge>
                                </CardAction>
                                <CardTitle>{formatDateShort(post.eventDate)} <span>({formatDay(post.eventDate)})</span> {post.eventStartTime} {post.eventTitle}</CardTitle>
                            </CardHeader>
                            <CardDescription>
                                <div className='dataTable'>
                                    <div className='dataTable-subject'>開催日時：</div>
                                    <div className='dataTable-items'>{formatDateShort!(post.eventDate)}　{post.eventStartTime} ～ {post.eventHour}時間</div>
                                    <div className='dataTable-subject'> 場所：</div>
                                    <div className='dataTable-items'>{post.eventPlace?.[0]?.courtName} ({post.eventCourtSurface})</div>
                                    <div className='dataTable-subject'>募集人数：</div>
                                    <div className='dataTable-items'>{post.eventMemberNum} 名</div>
                                    {/* <div className='dataTable-subject'>参加者：</div> */}
                                    {/* <div className='dataTable-items'>{post.member}</div> */}
                                </div>
                            </CardDescription>
                            <CardFooter>
                                <Link href={`/event/${post.id}`}>
                                    <Button className="w-full">詳細情報</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                );
            })}
        </div>
    )
}