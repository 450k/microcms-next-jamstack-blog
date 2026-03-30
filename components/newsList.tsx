import type { NewsItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Props型を定義
type Props = {
  newsItems?: NewsItem[];
};

export function NewsItems({ newsItems = [] }: Props) {
  if (newsItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">
        お知らせ
      </h3>
      <ul>
        {newsItems.map((news) => (
          <li key={news.id} className="py-4 ">
            <div className="grid auto-cols-max grid-flow-col gap-4">
              <span className="font-medium">{formatDate(news.publishedAt)}</span>
              <span className="font-normal line-clamp-2">📢 {news.newsTitle}</span>
              {news.linkTo && (
                <a href={news.linkTo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm self-start">
                  詳細 →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}