import { getArticlesByCategoryAndSub } from '@/lib/article';
import { getSubcategoriesByCategory } from '@/lib/categories';
import CategoryPage from '@/components/CategoryPage';

export default async function BigDataPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const subcategories = await getSubcategoriesByCategory('大数据');
  const articles = await getArticlesByCategoryAndSub('大数据', currentSub);

  return (
    <CategoryPage
      category="bigdata"
      subcategories={subcategories}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 