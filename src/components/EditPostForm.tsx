'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from './RichTextEditor'

interface Category {
  id: number
  name: string
  description?: string
}

interface Subcategory {
  id: number
  category_id: number
  key: string
  label: string
}

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  category?: string
  subcategory?: string
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
  const [subcategory, setSubcategory] = useState(initialData.subcategory || '')
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '')
  const [isPublished, setIsPublished] = useState(initialData.published)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 获取二级分类列表
  useEffect(() => {
    async function fetchSubcategories() {
      if (!category) {
        setSubcategories([])
        setSubcategory('')
        return
      }

      // 对于大数据、前端、安全分类，不显示二级分类
      if (['大数据', '前端', '安全'].includes(category)) {
        setSubcategories([])
        setSubcategory('')
        return
      }

      try {
        const response = await fetch(`/api/subcategories?category=${encodeURIComponent(category)}`)
        const data = await response.json()
        if (response.ok) {
          setSubcategories(data.subcategories || [])
        } else {
          setSubcategories([])
        }
      } catch (error) {
        console.error('获取二级分类失败:', error)
        setSubcategories([])
      }
    }
    fetchSubcategories()
  }, [category])

  // 文件导入处理
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError('')
    setSuccessMessage('')

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let importedContent = ''

      switch (fileExtension) {
        case 'md':
        case 'markdown':
          importedContent = await file.text()
          break
        
        case 'txt':
          // 保持原有的txt文件导入逻辑
          const textContent = await file.text()
          const lines = textContent.split('\n')
          importedContent = lines.map(line => {
            if (line.trim() === '') {
              return '<div><br></div>' // 空行保持为空行
            }
            return `<div>${line}</div>` // 每行独立显示
          }).join('')
          break
        
        case 'doc':
        case 'docx':
          // 使用API处理Word文档
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/import/word', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Word文档导入失败')
          }
          
          const result = await response.json()
          importedContent = result.content
          
          // 如果有警告信息，显示给用户
          if (result.warnings && result.warnings.length > 0) {
            console.warn('Word导入警告:', result.warnings)
            setSuccessMessage(`文件 "${file.name}" 导入成功！注意：${result.warnings.join(', ')}`)
          }
          break
        
        default:
          throw new Error('不支持的文件格式，请选择 .md, .txt, .doc 或 .docx 文件')
      }

      // 如果没有标题，尝试从内容中提取
      if (!title.trim()) {
        const firstLine = importedContent.split('\n')[0]
        if (firstLine.startsWith('#')) {
          setTitle(firstLine.replace(/^#+\s*/, ''))
          importedContent = importedContent.split('\n').slice(1).join('\n').trim()
        }
      }

      setContent(importedContent)
      if (!successMessage) {
        setSuccessMessage(`文件 "${file.name}" 导入成功！`)
      }
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '文件导入失败')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 清理HTML标签的函数
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      // 自动生成摘要时清理HTML标签
      const autoExcerpt = excerpt || stripHtmlTags(content).substring(0, 200)

      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialData.id,
          title,
          content,
          excerpt: autoExcerpt,
          category: category || null,
          subcategory: subcategory || null,
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
      {/* 消息提示 */}
      {(error || successMessage) && (
        <div className="mb-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}
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
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
              二级分类
            </label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择二级分类</option>
              {subcategories.map((subcat) => (
                <option key={subcat.id} value={subcat.key}>
                  {subcat.label}
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

        {/* 富文本编辑器 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              文章内容 *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".md,.markdown,.txt,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? '导入中...' : '📁 导入文件'}
              </button>
              <span className="text-xs text-gray-500">
                支持 .md/.txt/.doc/.docx
              </span>
            </div>
          </div>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="编辑你的文章内容... 支持富文本编辑和 Markdown 语法"
          />
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