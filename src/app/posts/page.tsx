import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import Link from 'next/link'
import DeletePostButton from '@/components/DeletePostButton'

export const revalidate = 0

interface PostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Posts({ searchParams }: PostsPageProps) {
  const supabase = createSupabaseAdmin()
  const adminInfo = await getAdminInfo()
  const params = await searchParams
  const category = params.category as string | undefined
  
  // 构建查询，如果有分类参数则过滤
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data: posts, error } = await query.order('created_at', { ascending: false })

  // 如果查询失败，显示错误信息
  if (error) {
    console.error('Posts query error:', error)
  }

  // 调试信息：输出文章数据
  console.log('Posts data:', posts)
  console.log('Posts count:', posts?.length || 0)
  if (posts && posts.length > 0) {
    console.log('First post slug:', posts[0].slug)
    console.log('First post data:', posts[0])
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {category ? `${category} - 文章列表` : '文章列表'}
          </h1>
          {category && (
            <p className="text-gray-600 mt-2">
              <Link href="/posts" className="hover:text-blue-600">所有文章</Link> / {category}
            </p>
          )}
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
                <div className="flex items-center space-x-3">
                  {adminInfo && (
                    <>
                      <Link 
                        href={`/posts/edit/${post.slug}`}
                        className="text-orange-600 hover:text-orange-800 font-medium"
                      >
                        ✏️ 编辑
                      </Link>
                      <DeletePostButton 
                        postId={post.id} 
                        postTitle={post.title} 
                      />
                    </>
                  )}
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    👁️ 查看
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {category ? `还没有${category}相关文章` : '还没有文章'}
          </h2>
          <p className="text-gray-600 mb-6">
            {category ? `开始创建第一篇${category}文章吧` : '开始分享你的技术见解吧'}
          </p>
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