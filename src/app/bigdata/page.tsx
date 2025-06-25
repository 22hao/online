import { getArticlesByCategoryWithPagination } from '@/lib/article';
import SimpleCategoryPage from '@/components/SimpleCategoryPage';

export default async function BigDataPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const pageSize = 9;
  
  const { articles, totalCount } = await getArticlesByCategoryWithPagination('大数据', currentPage, pageSize);

  return (
    <SimpleCategoryPage
      category="bigdata"
      categoryTitle="大数据"
      articles={articles}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
} 