'use client'

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface SimpleCategoryPageProps {
  category: string;
  categoryTitle: string;
  articles: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export default function SimpleCategoryPage({ 
  category, 
  categoryTitle, 
  articles, 
  totalCount, 
  currentPage, 
  pageSize 
}: SimpleCategoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    const query = params.toString();
    const url = query ? `/${category}?${query}` : `/${category}`;
    router.push(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 分类标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryTitle}</h1>
        <p className="text-gray-600">共 {totalCount} 篇文章</p>
      </div>

      {/* 文章列表 */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map(article => (
              <Link key={article.id} href={`/posts/${article.slug}`} className="block">
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="p-6">
                    <h2 className="text-lg font-bold mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {article.excerpt || article.content?.substring(0, 120) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{article.category}</span>
                      <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    
                    {/* 显示标签 */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 分页导航 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              {/* 上一页 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                上一页
              </button>

              {/* 页码 */}
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* 下一页 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        /* 如果没有文章 */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无文章</h2>
          <p className="text-gray-600">这个分类下还没有文章</p>
        </div>
      )}
    </div>
  );
} 