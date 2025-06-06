import { createSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createSupabaseServer()
  
  // 获取最新的3篇文章
  const { data: latestPosts } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id(email, name),
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl md:text-7xl mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              技术博客
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
            分享前沿技术见解，记录开发实践经验，探索编程世界的无限可能
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/posts"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              🚀 开始阅读
            </Link>
            {session && (
              <Link
                href="/posts/create"
                className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                ✍️ 写文章
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们的技术博客？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              基于现代技术栈构建，提供优秀的写作和阅读体验
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Markdown 支持</h3>
              <p className="text-gray-600">
                强大的 Markdown 编辑器，支持代码高亮、表格、数学公式等丰富格式
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">智能分类</h3>
              <p className="text-gray-600">
                通过分类和标签系统，轻松组织和发现感兴趣的技术内容
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">现代技术</h3>
              <p className="text-gray-600">
                基于 Next.js 15 和 Supabase，提供快速、稳定的阅读体验
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts && latestPosts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">最新文章</h2>
                <p className="text-gray-600">发现最新的技术见解和开发经验</p>
              </div>
              <Link
                href="/posts"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                查看全部 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <Link href={`/posts/${post.slug}`} className="group">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 120) + '...'}
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {post.profiles?.name || post.author?.name || post.author?.email}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备分享你的技术见解吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            加入我们的技术社区，与其他开发者一起分享知识和经验
          </p>
          {session ? (
            <Link
              href="/posts/create"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ✍️ 立即开始写作
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              🚀 立即加入
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
