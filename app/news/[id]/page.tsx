import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { client } from '@/lib/microcms';
import type { NewsItem } from '@/lib/types';

async function getNewsPost(id: string): Promise<NewsItem> {
  const data = await client.get({
    endpoint: 'news',
    contentId: id,
  });

  return data as NewsItem;
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getNewsPost(id);

  return (
    <article className="mx-auto max-w-3xl">
      <Button asChild className="mb-4">
        <Link href="/">← お知らせ一覧へ戻る</Link>
      </Button>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">{post.newsTitle}</h1>

      {post.newsContent ? (
        <div
          className="prose max-w-none whitespace-pre-wrap [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6"
          dangerouslySetInnerHTML={{
            __html: post.newsContent,
          }}
        />
      ) : (
        <p className="text-slate-600">本文はまだ登録されていません。</p>
      )}
    </article>
  );
}

export async function generateStaticParams() {
  const data = await client.get({
    endpoint: 'news',
    queries: {
      limit: 100,
    },
  });

  return data.contents.map((item: NewsItem) => ({
    id: item.id,
  }));
}
