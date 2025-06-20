import { getArticlesByCategoryAndSub } from '@/lib/article';
import { getSubcategoriesByCategory } from '@/lib/categories';
import CategoryPage from '@/components/CategoryPage';

export default async function CloudNativePage({ searchParams }: { searchParams: { sub?: string } }) {
  const currentSub = searchParams?.sub || '';
  const subcategories = await getSubcategoriesByCategory('云原生');
  const articles = await getArticlesByCategoryAndSub('云原生', currentSub);

  return (
    <CategoryPage
      category="cloudnative"
      subcategories={subcategories}
      currentSub={currentSub}
      articles={articles}
    />
  );
} 