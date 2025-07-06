import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createSupabaseServer()
  
  // 获取最新的6篇文章
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const adminInfo = await getAdminInfo()

  return (
    <div className="min-h-screen bg-white">

      {/* Latest Posts Section */}
      {latestPosts && latestPosts.length > 0 ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Admin Actions */}
          {adminInfo && (
            <div className="flex justify-end mb-8">
              <Link
                href="/posts/create"
                className="inline-block px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-900 transition-all duration-200"
              >
                写作
              </Link>
            </div>
          )}
          
          <div className="space-y-12">
            {latestPosts.map((post, index) => (
              <article key={post.id} className="group">
                <div className="space-y-3">
                  <Link href={`/posts/${post.slug}`}>
                    <h2 className={`font-light text-gray-900 group-hover:text-gray-600 transition-colors leading-tight ${
                      index === 0 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                    }`}>
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, index === 0 ? 200 : 150) + '...'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <span>{new Date(post.created_at).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* More Posts Link */}
          <div className="text-center mt-12 pt-12 border-t border-gray-200">
            <Link
              href="/posts"
              className="inline-block px-6 py-3 text-sm font-medium text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
            >
              查看所有文章
            </Link>
          </div>
        </section>
      ) : (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Admin Actions */}
          {adminInfo && (
            <div className="flex justify-end mb-8">
              <Link
                href="/posts/create"
                className="inline-block px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-900 transition-all duration-200"
              >
                写作
              </Link>
            </div>
          )}
          
          <div className="text-center py-20">
            <h2 className="text-xl font-light text-gray-900 mb-3">还没有文章</h2>
            <p className="text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
              这里即将充满有趣的想法和深度的思考
            </p>
          </div>
        </section>
      )}




    </div>
  )
}
