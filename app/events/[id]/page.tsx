import { client } from "@/lib/microcms"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate, formatDay, formatDateShort } from "@/lib/utils";
import { JoinMember } from '@/components/joinmembers';
import { TennisOffUrl } from "@/components/tennisoff-url";
import { AnnotationText } from "@/components/annotation_text";
import { EventPagination } from "@/components/event-pagination";
import { CategoryBadge } from '@/components/category-badge';
import type { EventDetail } from "@/lib/types";

import { EntryForm } from '@/components/entry-form';
import { EntryList } from '@/components/entry-list';

// microCMSから特定の記事を取得
async function getEventPost(id: string): Promise<EventDetail> {
  const data = await client.get({
    endpoint: 'event', 
    contentId: id,
  });
  return data;
}

// 全イベントを日付でソートして取得
async function getAllEventsSorted(): Promise<EventDetail[]> {
  const data = await client.get({
    endpoint: 'event',
    queries: {
      orders: 'eventDate',
      limit: 100,
    },
  });
  return data.contents;
}

// 前後のイベントを取得
async function getAdjacentEvents(currentId: string) {
  const allEvents = await getAllEventsSorted();
  const currentIndex = allEvents.findIndex(event => event.id === currentId);
  
  return {
    prevEvent: currentIndex > 0 ? allEvents[currentIndex - 1] : null,
    nextEvent: currentIndex < allEvents.length - 1 ? allEvents[currentIndex + 1] : null,
  };
}

// 記事詳細ページの生成
export default async function EventPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // IDを取得
  const post = await getEventPost(id);
  const { prevEvent, nextEvent } = await getAdjacentEvents(id);

  return (
    <>
    <article className="mx-auto max-w-3xl">
      <Button asChild className="mb-4">
        <Link href="/">← Back to all Events</Link>
      </Button>
      
      <h1 className="mb-4 text-4xl font-bold">
        {formatDateShort(post.eventDate)} <span className="text-2xl">({formatDay(post.eventDate)})</span>  {post.eventStartTime} ～ {post.eventTitle}
        <span className="ml-4">
          <CategoryBadge category={post.eventCategory?.[0]} />
        </span>
      </h1>

      <div className="prose max-w-none">
        <table className="w-full border-collapse mb-8">
          <tbody>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">開催日時</th>
              <td className="border p-2">
                {formatDateShort(post.eventDate)} ({formatDay(post.eventDate)}) {post.eventStartTime} から {post.eventHour}時間
              </td>
            </tr>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">場所</th>
              <td className="border p-2">{post.eventPlace?.courtName}</td>
            </tr>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">サーフェス</th>
              <td className="border p-2">
                {post.eventCourtSurface} （{post.eventCourtNum}面）
              </td>
            </tr>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">参加人数</th>
              <td className="border p-2">Max {post.eventMemberNum} 人</td>
            </tr>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">参加費</th>
              <td className="border p-2">{post.eventPrice}円　※参加人数次第</td>
            </tr>
          </tbody>
        </table>

        {post.eventContent && (
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">備考</h3>
            <div className="mb-8"
              dangerouslySetInnerHTML={{
                __html: post.eventContent,
              }}
            />
          </div>
        )}
      </div>
      
      {/* {post.member?.length > 0 && <JoinMember member={post.member} />} */}
      {post.tennisOffUrl && <TennisOffUrl tennisOffUrl={post.tennisOffUrl} />}
      
      <EntryList eventId={post.id} />
      <EntryForm eventId={post.id} eventTitle={post.eventTitle} />
      

      <AnnotationText />
    </article>
    
    <EventPagination prevEvent={prevEvent} nextEvent={nextEvent} />
    </>
  );
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({ endpoint: 'event' });

  return contentIds.map((contentId) => ({
    id: contentId,
  }));
}
