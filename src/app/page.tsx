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

  // 获取文章总数统计
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  const adminInfo = await getAdminInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform duration-300">
                  <span className="text-3xl">🚀</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                On Sre
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              探索 <span className="font-semibold text-blue-600">云原生</span>、
              <span className="font-semibold text-purple-600">大数据</span>、
              <span className="font-semibold text-indigo-600">运维</span> 技术的专业博客
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{totalPosts || 0}</div>
                <div className="text-sm text-gray-500">技术文章</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">5+</div>
                <div className="text-sm text-gray-500">技术领域</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-500">学习之路</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/posts"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                📚 浏览文章
              </Link>
              {adminInfo && (
                <Link
                  href="/posts/create"
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-medium rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  ✍️ 写文章
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts && latestPosts.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              最新<span className="text-blue-600">技术</span>分享
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              分享最新的技术见解和实践经验，助力技术成长之路
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <article 
                key={post.id} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
              >
                {/* Card Header */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                
                <div className="p-6">
                  {/* Category Badge */}
                  {post.category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                        {post.category}
                      </span>
                    </div>
                  )}
                  
                  <Link href={`/posts/${post.slug}`} className="block">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                  </p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag: string) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-lg">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{Math.ceil((post.content?.length || 0) / 500)}分钟阅读</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* More Posts Link */}
          <div className="text-center mt-12">
            <Link
              href="/posts"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>查看更多文章</span>
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-5xl">📚</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">即将开始精彩内容</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              第一篇技术分享正在路上，敬请期待！
            </p>
            {adminInfo && (
              <Link
                href="/posts/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✍️ 创建第一篇文章
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Tech Stack Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技术栈覆盖</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              深度探索现代技术栈，从基础架构到前沿技术
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: '云原生', icon: '☁️', color: 'from-blue-500 to-cyan-500', path: '/cloudnative' },
              { name: '大数据', icon: '📊', color: 'from-purple-500 to-pink-500', path: '/bigdata' },
              { name: '前端', icon: '💻', color: 'from-green-500 to-blue-500', path: '/frontend' },
              { name: '运维', icon: '⚙️', color: 'from-orange-500 to-red-500', path: '/ops' },
              { name: '安全', icon: '🔒', color: 'from-gray-500 to-gray-700', path: '/security' }
            ].map((tech, index) => (
              <div key={tech.name} className="group">
                <Link href={tech.path}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform group-hover:-translate-y-2">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tech.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{tech.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tech.name}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Enhanced hover effects */
        .group:hover .transform {
          transform: translateY(-4px);
        }
        
        /* Gradient text animation */
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .bg-gradient-to-r {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>


    </div>
  )
}
