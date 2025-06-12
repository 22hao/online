import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createSupabaseServer()
  
  // 获取最新的3篇文章
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const adminInfo = await getAdminInfo()

  return (
    <div className="min-h-screen">
      {/* Simple Hero Section */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              On Sre
            </span>
          </h1>
          {adminInfo && (
            <Link
              href="/posts/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✍️ 写文章
            </Link>
          )}
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts && latestPosts.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <Link
              href="/posts"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              查看全部 →
            </Link>
          </div>
          
          <div className="space-y-6">
            {latestPosts.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <Link href={`/posts/${post.slug}`} className="group">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">还没有文章</h2>
            <p className="text-gray-600">开始写下第一篇技术分享吧</p>
            {adminInfo && (
              <Link
                href="/posts/create"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建文章
              </Link>
            )}
          </div>
        </section>
      )}


    </div>
  )
}
