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

export default function CreatePostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  // 获取分类列表
  useEffect(() => {
    async function fetchData() {
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
    fetchData()
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

  // 计算字数
  const wordCount = content.replace(/<[^>]*>/g, '').length

  const generateSlug = (title: string) => {
    // 简化的slug生成逻辑
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
      .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
      .substring(0, 50) // 限制长度
    
    // 添加时间戳确保唯一性
    const timestamp = Date.now().toString(36)
    return `${baseSlug}-${timestamp}`
  }

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
      const slug = generateSlug(title)
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      // 自动生成摘要时清理HTML标签
      const autoExcerpt = excerpt || stripHtmlTags(content).substring(0, 200)

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: autoExcerpt,
          category: category || null,
          subcategory: subcategory || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          published: isPublished,
          slug,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '发布失败')
        return
      }

      setSuccessMessage('文章发布成功！')
      setTimeout(() => {
        router.push('/posts')
      }, 1500)
    } catch {
      setError('发布失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = (tag: string) => {
    const currentTags = tags.split(',').map(t => t.trim()).filter(t => t)
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ')
      setTags(newTags)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              {/* 字数统计 */}
              {wordCount > 0 && (
                <div className="text-sm text-gray-500">
                  {wordCount} 字
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="max-w-6xl mx-auto p-6">
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

        <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
          {/* 标题输入 - 类似知乎样式 */}
          <div className="bg-white rounded-lg shadow-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-6 py-6 text-2xl font-medium border-0 rounded-lg focus:ring-0 focus:outline-none resize-none"
              placeholder="请输入标题（最多 100 个字）"
              maxLength={100}
            />
          </div>

          {/* 内容编辑器 - 富文本编辑器 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="开始写作吧... 支持富文本编辑和 Markdown 语法"
            />
          </div>

          {/* 文章设置面板 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">文章设置</h3>
              
              {/* 文件导入按钮 */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,.doc,.docx"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>导入中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span>导入文件</span>
                      <span className="text-xs text-gray-400">(MD/TXT/Word)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 摘要 */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  文章摘要
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="简短描述文章内容，有助于SEO优化（留空将自动生成前200字）..."
                />
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  文章分类
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory('') // 切换一级分类时重置二级分类
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 二级分类 */}
              {category && subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    二级分类
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">选择二级分类</option>
                    {subcategories.map((sub) => (
                      <option key={sub.key} value={sub.key}>{sub.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  标签
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="用逗号分隔多个标签..."
                />
                
                {/* 标签建议 */}
                {subcategories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">二级分类：</p>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((sub) => (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => setSubcategory(sub.key)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 发布设置 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">发布设置</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {isPublished ? '📢 立即发布' : '📝 保存为草稿'}
                    </span>
                  </label>
                  
                  <div className="text-sm text-gray-500">
                    {isPublished 
                      ? '文章将立即对所有访问者可见'
                      : '文章将保存为草稿，只有管理员可见'
                    }
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/posts')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    取消
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !content.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>发布中...</span>
                      </span>
                    ) : (
                      isPublished ? '🚀 发布文章' : '💾 保存草稿'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 