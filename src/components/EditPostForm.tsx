'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'

interface Category {
  name: string
  description?: string
}

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  published: boolean
  slug: string
}

interface EditPostFormProps {
  initialData: Post
}

export default function EditPostForm({ initialData }: EditPostFormProps) {
  const [title, setTitle] = useState(initialData.title)
  const [content, setContent] = useState(initialData.content)
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [category, setCategory] = useState(initialData.category || '')
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '')
  const [isPublished, setIsPublished] = useState(initialData.published)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const router = useRouter()

  // 获取分类列表
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories/list')
        const data = await response.json()
        if (response.ok) {
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialData.id,
          title,
          content,
          excerpt: excerpt || content.substring(0, 200),
          category: category || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          published: isPublished,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '更新失败')
        return
      }

      // 更新成功，跳转到文章详情页
      router.push(`/posts/${initialData.slug}`)
    } catch {
      setError('更新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销！')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/delete?id=${initialData.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '删除失败')
        return
      }

      // 删除成功，跳转到文章列表
      router.push('/posts')
    } catch {
      setError('删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
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
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
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
              placeholder="用逗号分隔多个标签，如：Kubernetes, Prometheus, DevOps"
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
                placeholder: '使用 Markdown 语法编写你的文章内容...\n\n支持：\n- 标题：# ## ###\n- 代码块：```bash\n- 列表：- 或 1.\n- 链接：[文本](URL)\n- 图片：![alt](URL)',
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
            <span className="ml-2 text-sm text-gray-700">发布文章</span>
          </label>
          <span className="text-sm text-gray-500">
            {isPublished ? '文章将公开可见' : '保存为草稿'}
          </span>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? '删除中...' : '🗑️ 删除'}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '更新中...' : '更新文章'}
          </button>
        </div>
      </form>
    </>
  )
} 