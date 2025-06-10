'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'
import mammoth from 'mammoth/mammoth.browser'
import TurndownService from 'turndown'

interface Category {
  name: string
  description?: string
}

export default function CreatePostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [wordCount, setWordCount] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const turndownService = new TurndownService()

  // 获取分类和标签建议
  useEffect(() => {
    async function fetchData() {
      try {
        // 获取分类
        const categoriesRes = await fetch('/api/categories/list')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }

        // 获取热门标签
        const tagsRes = await fetch('/api/tags')
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          const popularTags = Object.keys(tagsData.tags || {})
            .sort((a, b) => (tagsData.tags[b]?.total || 0) - (tagsData.tags[a]?.total || 0))
            .slice(0, 10)
          setTagSuggestions(popularTags)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    }
    fetchData()
  }, [])

  // 计算字数
  useEffect(() => {
    const plainText = content.replace(/[#*`\[\]()]/g, '').trim()
    setWordCount(plainText.length)
  }, [content])

  const generateSlug = (title: string) => {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // 如果处理后的slug为空，使用默认前缀
    if (!baseSlug) {
      baseSlug = 'post'
    }
    
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

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let importedContent = ''

      switch (fileExtension) {
        case 'md':
        case 'markdown':
          importedContent = await file.text()
          break
        
        case 'txt':
          const textContent = await file.text()
          importedContent = textContent.replace(/\n/g, '\n\n')
          break
        
        case 'doc':
        case 'docx':
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.convertToHtml({ arrayBuffer })
          importedContent = turndownService.turndown(result.value)
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
      setSuccessMessage(`文件 "${file.name}" 导入成功！`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const slug = generateSlug(title)
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200),
          category: category || null,
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

          {/* 内容编辑器 - 恢复原来的样式 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              height={700}
              data-color-mode="light"
              textareaProps={{
                placeholder: '开始写作吧...\n\n✨ 支持 Markdown 语法\n📝 可以导入外部文件\n🎯 专注于内容创作',
                style: { 
                  fontSize: '16px',
                  lineHeight: '1.8',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  padding: '24px'
                }
              }}
              style={{
                backgroundColor: 'white',
              }}
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
                  onChange={(e) => setCategory(e.target.value)}
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
                {tagSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">热门标签：</p>
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {tag}
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