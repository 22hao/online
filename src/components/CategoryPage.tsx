import Link from 'next/link';

interface CategoryPageProps {
  category: string;
  subcategories: { key: string; label: string }[];
  currentSub: string;
  articles: any[];
}

export default function CategoryPage({ category, subcategories, currentSub, articles }: CategoryPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 二级分类标签 */}
      <div className="flex space-x-3 mb-8">
        <Link
          href={`/${category}`}
          className={`px-4 py-2 rounded-full ${!currentSub ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          全部
        </Link>
        {subcategories.map(sub => (
          <Link
            key={sub.key}
            href={`/${category}?sub=${sub.key}`}
            className={`px-4 py-2 rounded-full ${currentSub === sub.key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {sub.label}
          </Link>
        ))}
      </div>
      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(article => (
          <Link key={article.id} href={`/posts/${article.slug}`} className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-lg font-bold mb-2 hover:text-blue-600 transition-colors">{article.title}</h2>
              <p className="text-gray-600 mb-2">{article.excerpt || article.content?.substring(0, 100) + '...'}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{article.subcategory || article.category}</div>
                <div className="text-sm text-gray-400">
                  {new Date(article.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* 如果没有文章 */}
      {articles.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无文章</h2>
          <p className="text-gray-600">这个分类下还没有文章</p>
        </div>
      )}
    </div>
  );
} 