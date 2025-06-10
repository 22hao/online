'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  published: boolean
  slug: string
  created_at: string
  updated_at: string
}

interface PostsManagerProps {
  posts: Post[]
}

export default function PostsManager({ posts }: PostsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 获取所有分类
  const categories = useMemo(() => {
    const allCategories = posts
      .map(post => post.category)
      .filter((category): category is string => !!category)
    return [...new Set(allCategories)].sort()
  }, [posts])

  // 过滤和排序文章
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      // 搜索过滤
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const titleMatch = post.title.toLowerCase().includes(searchLower)
        const contentMatch = post.content.toLowerCase().includes(searchLower)
        const categoryMatch = post.category?.toLowerCase().includes(searchLower)
        const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!titleMatch && !contentMatch && !categoryMatch && !tagMatch) {
          return false
        }
      }

      // 分类过滤
      if (selectedCategory && post.category !== selectedCategory) {
        return false
      }

      // 状态过滤
      if (statusFilter === 'published' && !post.published) {
        return false
      }
      if (statusFilter === 'draft' && post.published) {
        return false
      }

      return true
    })

    // 排序
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy]
      let bValue: string | number = b[sortBy]

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [posts, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setStatusFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索文章
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索标题、内容、分类或标签..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类筛选
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有分类</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态筛选
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>

          {/* 排序选项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排序方式
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'updated_at' | 'title')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">创建时间</option>
                <option value="updated_at">更新时间</option>
                <option value="title">标题</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? '升序' : '降序'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* 筛选器操作 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            找到 {filteredPosts.length} 篇文章
            {filteredPosts.length !== posts.length && (
              <span className="text-gray-500">（共 {posts.length} 篇）</span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            清除筛选
          </button>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">文章列表</h2>
        </div>
        
        {filteredPosts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? '已发布' : '草稿'}
                      </span>
                      {post.category && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {post.category}
                        </span>
                      )}
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>
                        创建：{new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      {post.updated_at !== post.created_at && (
                        <span>
                          更新：{new Date(post.updated_at).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <span>
                          标签：{post.tags.slice(0, 3).join(', ')}
                          {post.tags.length > 3 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    {post.published && (
                      <Link
                        href={`/posts/${post.slug}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                        target="_blank"
                      >
                        👁️ 查看
                      </Link>
                    )}
                    <Link
                      href={`/posts/edit/${post.slug}`}
                      className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800"
                    >
                      ✏️ 编辑
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory || statusFilter !== 'all' 
                ? '没有找到匹配的文章' 
                : '还没有文章'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory || statusFilter !== 'all'
                ? '尝试调整筛选条件或清除筛选'
                : '开始创建你的第一篇技术文章吧'}
            </p>
            {(!searchTerm && !selectedCategory && statusFilter === 'all') && (
              <Link
                href="/posts/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✍️ 写文章
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 