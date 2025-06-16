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
          <div key={article.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-2">{article.summary}</p>
            <div className="text-sm text-gray-400">{article.subcategory}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 