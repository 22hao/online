import { getArticlesByCategoryWithPagination } from '@/lib/article';
import SimpleCategoryPage from '@/components/SimpleCategoryPage';

export default async function FrontendPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const pageSize = 9;
  
  const { articles, totalCount } = await getArticlesByCategoryWithPagination('前端', currentPage, pageSize);

  return (
    <SimpleCategoryPage
      category="frontend"
      categoryTitle="前端"
      articles={articles}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
} 