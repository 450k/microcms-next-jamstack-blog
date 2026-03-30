import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category?: string;
}

// カテゴリーごとのクラス名を決定するヘルパー関数
function getCategoryClassName(category: string | undefined): string {
  if (!category) return '';
  
  const classNameMap: { [key: string]: string } = {
    'シングルス': 'bg-yellow-100 text-yellow-800',
    'ダブルス': 'bg-green-100 text-green-800',
    'ミックスダブルス': 'bg-purple-100 text-purple-800',
    '基礎練習': 'bg-blue-100 text-blue-800',
  };
  
  return classNameMap[category] || 'bg-gray-100 text-gray-800';
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) {
    return <Badge variant="outline">その他</Badge>;
  }
  
  return (
    <Badge variant="secondary" className={getCategoryClassName(category)}>
      {category}
    </Badge>
  );
}
