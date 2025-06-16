import { getArticlesByCategoryAndSub } from '@/lib/article';
import CategoryPage from '@/components/CategoryPage';

export default async function SecurityPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/subcategories?category=安全`, { cache: 'no-store' });
  const { subcategories } = await res.json();
  const articles = await getArticlesByCategoryAndSub('安全', currentSub);

  return (
    <CategoryPage
      category="security"
      subcategories={subcategories.map((sub: any) => ({ key: sub.key, label: sub.label }))}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 