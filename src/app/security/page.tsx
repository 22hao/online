import { getArticlesByCategoryWithPagination } from '@/lib/article';
import SimpleCategoryPage from '@/components/SimpleCategoryPage';

export default async function SecurityPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const pageSize = 9;
  
  const { articles, totalCount } = await getArticlesByCategoryWithPagination('安全', currentPage, pageSize);

  return (
    <SimpleCategoryPage
      category="security"
      categoryTitle="安全"
      articles={articles}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
} 