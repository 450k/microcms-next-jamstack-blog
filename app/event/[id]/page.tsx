import { client } from "@/lib/microcms"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate,formatDay,formatDateShort } from "@/lib/utils";
import { JoinMember } from '@/components/joinmembers';
import { TennisOffUrl } from "@/components/tennisoff-url";
import { AnnotationText } from "@/components/annotation_text";

type EventCategory = {
  id: string;
  name: string;
};

type EventPlace = {
  id: string;
  courtName: string;
  thumbnail_img: {
    url: string;
    height: number;
    width: number;
  };
};

// ブログ記事の型定義
type Props = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventDate: string;
  eventStartTime: string;
  eventHour: string;
  eventPlace: EventPlace[];
  eventMemberNum: number;
  eventCourtNum: number;
  eventCourtSurface: string;
  eventPrice: number;
  eventContent: string;
  member: string[];
  tennisOffUrl: string;
};

// microCMSから特定の記事を取得
async function getEventPost(id: string): Promise<Props> {
  const data = await client.get({
    endpoint: 'event', 
    contentId: id,
  });
  return data;
}

// 記事詳細ページの生成
export default async function EventPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // IDを取得
  const post = await getEventPost(id);

  return (
    <article className="mx-auto max-w-3xl">
      <Button asChild className="mb-4">
        <Link href="/">← Back to all Events</Link>
      </Button>
      
      <h1 className="mb-4 text-4xl font-bold">{formatDateShort(post.eventDate)} ({formatDay(post.eventDate)})  {post.eventStartTime} ～ {post.eventTitle} <span><Badge variant="secondary" className={post.eventCategory?.id}>{post.eventCategory?.name}</Badge></span></h1>

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
              <td className="border p-2">{post.eventPlace?.[0]?.courtName}</td>
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
      
      {post.member?.length > 0 && <JoinMember member={post.member} />}
      {post.tennisOffUrl && <TennisOffUrl tennisOffUrl={post.tennisOffUrl} />}
      <AnnotationText />
    </article>
    
  );
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({ endpoint: 'event' });

  return contentIds.map((contentId) => ({
    id: contentId, // 各記事のIDをパラメータとして返す
  }));
}



// ----------------------------------------------------------------------------