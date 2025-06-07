import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import Link from 'next/link'

export const revalidate = 0

export default async function Posts() {
  const supabase = await createSupabaseServer()
  const adminInfo = await getAdminInfo()
  
  // 简化查询，移除可能有问题的关联
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // 如果查询失败，显示错误信息
  if (error) {
    console.error('Posts query error:', error)
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">技术博客</h1>
          <p className="text-gray-600">分享技术见解和开发经验</p>
        </div>
        {adminInfo && (
          <Link
            href="/posts/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ✍️ 写文章
          </Link>
        )}
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-8">
          {posts.map((post) => (
            <article key={post.id} className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link href={`/posts/${post.slug}`} className="group">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt || post.content.substring(0, 200) + '...'}
                  </p>
                </div>
              </div>
              
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 分类 */}
              {post.category && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                    📂 {post.category}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>👤 管理员</span>
                  <span>📅 {new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <Link 
                  href={`/posts/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  阅读全文 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">还没有文章</h2>
          <p className="text-gray-600 mb-6">开始分享你的技术见解吧</p>
          {adminInfo && (
            <Link
              href="/posts/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ✍️ 写第一篇文章
            </Link>
          )}
        </div>
      )}
    </div>
  )
}