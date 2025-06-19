import { getArticlesByCategoryAndSub } from '@/lib/article';
import { getSubcategoriesByCategory } from '@/lib/categories';
import CategoryPage from '@/components/CategoryPage';

export default async function FrontendPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const subcategories = await getSubcategoriesByCategory('前端');
  const articles = await getArticlesByCategoryAndSub('前端', currentSub);

  return (
    <CategoryPage
      category="frontend"
      subcategories={subcategories}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 