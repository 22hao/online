import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminInfo } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, content')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    return {
      title: '文章不存在'
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160)
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const adminInfo = await getAdminInfo()
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Post query error:', error)
  }

  if (!post) {
    notFound()
  }

  return (
    <article className="w-full max-w-4xl mx-auto py-16 px-8">
      {/* 文章头部 */}
      <header className="mb-12">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <Link href="/posts" className="hover:text-blue-600">
            ← 返回文章列表
          </Link>
          {adminInfo && (
            <Link
              href={`/posts/edit/${slug}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✏️ 编辑文章
            </Link>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <div className="font-medium text-gray-900">管理员</div>
              <div className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {post.updated_at !== post.created_at && (
                  <span className="ml-2">
                    · 更新于 {new Date(post.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 分类 */}
            {post.category && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                📂 {post.category}
              </span>
            )}
          </div>
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
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
      </header>

      {/* 文章内容 */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          components={{
            code: ({className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match
              
              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
              
              return (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            }
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* 相关推荐或其他内容可以放在这里 */}
    </article>
  )
} 