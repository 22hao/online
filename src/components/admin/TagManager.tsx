'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TagStats {
  total: number
  published: number
}

interface TagManagerProps {
  initialTags: Record<string, TagStats>
}

export default function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // 编辑标签
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editTagName, setEditTagName] = useState('')

  const router = useRouter()

  // 常用的 SRE 标签推荐
  const recommendedTags = [
    'Kubernetes',
    'Docker',
    'Prometheus',
    'Grafana',
    'Ansible',
    'Terraform',
    'Jenkins',
    'GitLab CI',
    'AWS',
    'Azure',
    'GCP',
    'Linux',
    'Shell',
    'Python',
    'Go',
    'Nginx',
    'MySQL',
    'Redis',
    'ELK',
    'Jaeger',
    '故障排查',
    '性能调优',
    '高可用',
    '负载均衡',
    '微服务',
    '服务网格',
    'Istio',
    'Envoy'
  ]

  // 获取标签使用频率排序
  const sortedTags = Object.entries(tags)
    .sort(([,a], [,b]) => b.total - a.total)

  // 获取最受欢迎的标签（前10个）
  const popularTags = sortedTags.slice(0, 10)

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

  const handleEditTag = async (oldName: string) => {
    if (!editTagName.trim()) {
      showMessage('标签名称不能为空', true)
      return
    }

    if (editTagName.trim() === oldName) {
      setEditingTag(null)
      return
    }

    if (tags[editTagName.trim()]) {
      showMessage('标签名称已存在', true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editTagName.trim() })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '更新标签失败')
      }

      // 更新本地状态
      const newTags = { ...tags }
      newTags[editTagName.trim()] = newTags[oldName]
      delete newTags[oldName]
      setTags(newTags)

      setEditingTag(null)
      showMessage('标签更新成功')
      router.refresh()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '更新标签失败', true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTag = async (tagName: string) => {
    const stats = tags[tagName]
    if (!confirm(`确定要删除标签"${tagName}"吗？这将从 ${stats.total} 篇文章中移除此标签。`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tags?name=${encodeURIComponent(tagName)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '删除标签失败')
      }

      // 从本地状态中删除
      const newTags = { ...tags }
      delete newTags[tagName]
      setTags(newTags)

      showMessage(data.message || '标签删除成功')
      router.refresh()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '删除标签失败', true)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (tagName: string) => {
    setEditingTag(tagName)
    setEditTagName(tagName)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setEditTagName('')
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

      {/* 热门标签 */}
      {popularTags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">热门标签 TOP 10</h2>
            <p className="text-sm text-gray-600 mt-1">使用频率最高的标签</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTags.map(([tag, stats], index) => (
                <div key={tag} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {editingTag === tag ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleEditTag(tag)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditTag(tag)}
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
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{tag}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{stats.total} 次使用</span>
                            <button
                              onClick={() => startEdit(tag)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              disabled={isLoading}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(stats.total / popularTags[0][1].total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.published} 篇已发布文章使用
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 所有标签列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">所有标签</h2>
          <p className="text-sm text-gray-600 mt-1">当前博客中使用的所有标签</p>
        </div>
        
        {Object.keys(tags).length > 0 ? (
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {sortedTags.map(([tag, stats]) => (
                <div
                  key={tag}
                  className="group inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {editingTag === tag ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleEditTag(tag)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditTag(tag)}
                        disabled={isLoading}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-800 mr-2">
                        {tag}
                      </span>
                      <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full mr-2">
                        {stats.total}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => startEdit(tag)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          disabled={isLoading}
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无标签数据</h3>
            <p className="text-gray-600">开始为文章添加标签后，统计信息将显示在这里</p>
          </div>
        )}
      </div>

      {/* 推荐标签 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">SRE 推荐标签</h2>
          <p className="text-sm text-gray-600 mt-1">适合 SRE 技术博客的常用标签</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {recommendedTags.map((tag) => {
              const isUsed = tags[tag]
              return (
                <div
                  key={tag}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    isUsed
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    isUsed ? 'text-orange-900' : 'text-gray-700'
                  }`}>
                    {tag}
                  </div>
                  {isUsed && (
                    <div className="text-xs text-orange-600 mt-1">
                      已使用 {tags[tag].total} 次
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-orange-900 mb-2">标签管理说明</h3>
            <div className="text-orange-800 space-y-2">
              <p>• 点击标签旁的 ✏️ 图标可以编辑标签名称</p>
              <p>• 点击 🗑️ 图标可以删除标签（会从所有文章中移除）</p>
              <p>• 编辑标签名称会同步更新所有使用该标签的文章</p>
              <p>• 删除标签是不可逆操作，请谨慎操作</p>
              <p>• 建议使用标准的技术名称以保持一致性</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 