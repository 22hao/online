import { getArticlesByCategoryAndSub } from '@/lib/article';
import { getSubcategoriesByCategory } from '@/lib/categories';
import CategoryPage from '@/components/CategoryPage';

export default async function OpsPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const subcategories = await getSubcategoriesByCategory('运维');
  const articles = await getArticlesByCategoryAndSub('运维', currentSub);

  return (
    <CategoryPage
      category="ops"
      subcategories={subcategories}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 