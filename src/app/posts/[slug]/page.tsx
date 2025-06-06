import { createSupabaseServer } from '@/lib/supabase-server'
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
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id(email, name),
      profiles!posts_author_id_fkey(name, avatar_url, bio)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <article className="w-full max-w-4xl mx-auto py-16 px-8">
      {/* 文章头部 */}
      <header className="mb-12">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/posts" className="hover:text-blue-600">
            ← 返回文章列表
          </Link>
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
            {post.profiles?.avatar_url && (
              <Image
                src={post.profiles.avatar_url}
                alt={post.profiles.name || '作者'}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-gray-900">
                {post.profiles?.name || post.author?.name || post.author?.email}
              </div>
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

      {/* 作者信息 */}
      {post.profiles?.bio && (
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">关于作者</h3>
          <div className="flex items-start space-x-4">
            {post.profiles.avatar_url && (
              <Image
                src={post.profiles.avatar_url}
                alt={post.profiles.name || '作者'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-gray-900 mb-1">
                {post.profiles.name || post.author?.name || post.author?.email}
              </div>
              <p className="text-gray-600">{post.profiles.bio}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
} 