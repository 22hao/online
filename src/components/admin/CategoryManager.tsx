'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryStats {
  total: number
  published: number
}

interface CategoryManagerProps {
  initialCategories: Record<string, CategoryStats>
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // 添加分类
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  
  // 编辑分类
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  const router = useRouter()

  // 获取所有分类（包括未使用的）
  const [allCategories, setAllCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const response = await fetch('/api/categories/list')
        const data = await response.json()
        if (response.ok) {
          setAllCategories(data.categories?.map((cat: any) => cat.name) || [])
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    }
    fetchAllCategories()
  }, [])

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setError(message)
      setSuccessMessage('')
    } else {
      setSuccessMessage(message)
      setError('')
    }
    setTimeout(() => {
      setError('')
      setSuccessMessage('')
    }, 3000)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showMessage('分类名称不能为空', true)
      return
    }

    if (categories[newCategoryName.trim()]) {
      showMessage('分类已存在', true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '添加分类失败')
      }

      // 添加到本地状态
      setCategories(prev => ({
        ...prev,
        [newCategoryName.trim()]: { total: 0, published: 0 }
      }))
      
      // 添加到所有分类列表
      setAllCategories(prev => [...prev, newCategoryName.trim()].sort())

      setNewCategoryName('')
      setShowAddForm(false)
      showMessage('分类添加成功')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '添加分类失败', true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = async (oldName: string) => {
    if (!editCategoryName.trim()) {
      showMessage('分类名称不能为空', true)
      return
    }

    if (editCategoryName.trim() === oldName) {
      setEditingCategory(null)
      return
    }

    if (categories[editCategoryName.trim()]) {
      showMessage('分类名称已存在', true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editCategoryName.trim() })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '更新分类失败')
      }

      // 更新本地状态
      const newCategories = { ...categories }
      newCategories[editCategoryName.trim()] = newCategories[oldName]
      delete newCategories[oldName]
      setCategories(newCategories)
      
      // 更新所有分类列表
      setAllCategories(prev => 
        prev.map(cat => cat === oldName ? editCategoryName.trim() : cat).sort()
      )

      setEditingCategory(null)
      showMessage('分类更新成功')
      router.refresh()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '更新分类失败', true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryName: string) => {
    const stats = categories[categoryName]
    if (stats && stats.total > 0) {
      if (!confirm(`分类"${categoryName}"下还有 ${stats.total} 篇文章，删除分类会将这些文章的分类清空。确定继续吗？`)) {
        return
      }
    } else if (!confirm(`确定要删除分类"${categoryName}"吗？`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories?name=${encodeURIComponent(categoryName)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '删除分类失败')
      }

      // 从本地状态中删除
      const newCategories = { ...categories }
      delete newCategories[categoryName]
      setCategories(newCategories)
      
      // 从所有分类列表中删除
      setAllCategories(prev => prev.filter(cat => cat !== categoryName))

      showMessage('分类删除成功')
      router.refresh()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '删除分类失败', true)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (categoryName: string) => {
    setEditingCategory(categoryName)
    setEditCategoryName(categoryName)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditCategoryName('')
  }

  return (
    <div className="space-y-6">
      {/* 成功/错误消息 */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 添加分类 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">管理分类</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? '取消' : '+ 添加分类'}
          </button>
        </div>

        {showAddForm && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入新分类名称"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 使用中的分类 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">使用中的分类</h2>
          <p className="text-sm text-gray-600 mt-1">包含文章的分类及其统计信息</p>
        </div>
        
        {Object.keys(categories).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {Object.entries(categories)
              .sort(([,a], [,b]) => b.total - a.total)
              .map(([categoryName, stats]) => (
                <div key={categoryName} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <span className="text-lg">📂</span>
                      </div>
                      <div className="flex-1">
                        {editingCategory === categoryName ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(categoryName)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditCategory(categoryName)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              保存
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-medium text-gray-900">
                              {categoryName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              总共 {stats.total} 篇文章，其中 {stats.published} 篇已发布
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {editingCategory !== categoryName && (
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                          <div className="text-sm text-gray-500">文章</div>
                        </div>
                        <button
                          onClick={() => startEdit(categoryName)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(categoryName)}
                          className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                          disabled={isLoading}
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分类数据</h3>
            <p className="text-gray-600">开始创建文章后，分类信息将显示在这里</p>
          </div>
        )}
      </div>

      {/* 所有分类 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">所有分类</h2>
          <p className="text-sm text-gray-600 mt-1">可以在创建文章时选择的分类选项</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allCategories.map((category: string) => {
              const hasArticles = categories[category]
              return (
                <div
                  key={category}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    hasArticles
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      hasArticles ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {category}
                    </span>
                    {hasArticles && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {categories[category].total} 篇
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 