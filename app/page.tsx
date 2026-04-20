import { EventCard } from '@/components/eventcard';
import { NewsItems } from '@/components/newsList';
import { client } from '@/lib/microcms';
import type { NewsItem } from '@/lib/types';

// ニュースデータを取得
async function getNews(): Promise<NewsItem[]> {
  try {
    const data = await client.get({
      endpoint: 'news',
      queries: {
        limit: 10,
      },
    });
    return data.contents as NewsItem[];
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const newsItems = await getNews();
  return (
    <>
      <h2 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance mb-6">
      練習会一覧
    </h2>
    <h3 className="scroll-m-20 text-center text-lg font-medium tracking-tight mb-8 ">
      定員に達しているものでも参加できる場合があります。希望あれば連絡ください。
    </h3>
      <NewsItems newsItems={newsItems} />
      <EventCard />
    </>
  );
}
