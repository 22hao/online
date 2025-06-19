import { getArticlesByCategoryAndSub } from '@/lib/article';
import { getSubcategoriesByCategory } from '@/lib/categories';
import CategoryPage from '@/components/CategoryPage';

export default async function SecurityPage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const subcategories = await getSubcategoriesByCategory('安全');
  const articles = await getArticlesByCategoryAndSub('安全', currentSub);

  return (
    <CategoryPage
      category="security"
      subcategories={subcategories}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 