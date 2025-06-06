'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseBrowser()
  const router = useRouter()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('请先登录')
        return
      }

      const slug = generateSlug(title)
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200),
          category: category || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          author_id: session.user.id,
          published: isPublished,
          slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.push('/posts')
    } catch {
      setError('发布失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✍️ 创建文章</h1>
        <p className="text-gray-600">分享你的技术见解和开发经验</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            文章标题 *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="输入文章标题..."
          />
        </div>

        {/* 摘要 */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            文章摘要
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="简短描述文章内容（留空将自动生成）..."
          />
        </div>

        {/* 分类和标签 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              文章分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择分类</option>
              <option value="前端开发">前端开发</option>
              <option value="后端开发">后端开发</option>
              <option value="移动开发">移动开发</option>
              <option value="数据库">数据库</option>
              <option value="DevOps">DevOps</option>
              <option value="人工智能">人工智能</option>
              <option value="架构设计">架构设计</option>
              <option value="编程语言">编程语言</option>
              <option value="工具推荐">工具推荐</option>
              <option value="技术感想">技术感想</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="用逗号分隔多个标签，如：React, TypeScript, 前端"
            />
          </div>
        </div>

        {/* Markdown 编辑器 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章内容 *
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
                         <MDEditor
               value={content}
               onChange={(val) => setContent(val || '')}
               preview="edit"
               hideToolbar={false}
               visibleDragbar={false}
               textareaProps={{
                 placeholder: '使用 Markdown 语法编写你的文章内容...\n\n支持：\n- 标题：# ## ###\n- 代码块：```javascript\n- 列表：- 或 1.\n- 链接：[文本](URL)\n- 图片：![alt](URL)',
                 style: { minHeight: '400px' }
               }}
             />
          </div>
        </div>

        {/* 发布选项 */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">立即发布</span>
          </label>
          <span className="text-sm text-gray-500">
            {isPublished ? '文章将公开可见' : '保存为草稿'}
          </span>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '发布中...' : (isPublished ? '发布文章' : '保存草稿')}
          </button>
        </div>
      </form>
    </div>
  )
}