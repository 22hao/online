import { getArticlesByCategoryAndSub } from '@/lib/article';
import CategoryPage from '@/components/CategoryPage';

export default async function OpsPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  // 适配本地和线上环境的 fetch URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/subcategories?category=运维`, { cache: 'no-store' });
  const { subcategories } = await res.json();
  const articles = await getArticlesByCategoryAndSub('运维', currentSub);

  return (
    <CategoryPage
      category="ops"
      subcategories={subcategories.map((sub: any) => ({ key: sub.key, label: sub.label }))}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 