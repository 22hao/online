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
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl md:text-7xl mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              On Sre
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
            分享 SRE 实践经验，探索运维技术前沿，记录系统可靠性工程之路
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/posts"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              🚀 开始阅读
            </Link>
            {adminInfo && (
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">专注 SRE 技术分享</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              系统可靠性工程实践、运维自动化、监控告警、故障处理经验分享
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">运维实践</h3>
              <p className="text-gray-600">
                分享真实的运维场景和解决方案，从监控到自动化的完整实践
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">可靠性工程</h3>
              <p className="text-gray-600">
                系统可靠性设计、故障预防、性能优化等 SRE 核心理念和方法
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">技术前沿</h3>
              <p className="text-gray-600">
                云原生、容器化、微服务等现代运维技术的探索和应用
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
                <p className="text-gray-600">发现最新的 SRE 实践和运维技术</p>
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
                      <span>On Sre</span>
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

      {/* About Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            关于 On Sre
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            专注于系统可靠性工程（SRE）的技术博客，分享运维实践、故障处理、监控告警、自动化运维等领域的经验和见解。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 内容方向</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• 系统可靠性设计与实践</li>
                <li>• 监控告警体系建设</li>
                <li>• 故障处理与复盘</li>
                <li>• 运维自动化工具</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ 技术栈</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Kubernetes & Docker</li>
                <li>• Prometheus & Grafana</li>
                <li>• CI/CD 流水线</li>
                <li>• 云原生技术</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
