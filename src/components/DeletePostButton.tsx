'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/delete?id=${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 删除成功，刷新页面
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800 font-medium transition-colors flex items-center gap-1"
        disabled={isDeleting}
        title="删除文章"
      >
        🗑️ 删除
      </button>

      {/* 确认对话框 */}
      {showConfirm && (
        <div 
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999999,
            position: 'fixed'
          }}
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 shadow-xl"
            style={{ 
              maxWidth: '400px',
              width: '90%',
              position: 'relative',
              zIndex: 999999
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              确定要删除文章 <strong className="text-gray-900">"{postTitle}"</strong> 吗？
              <br />
              <span className="text-red-600 text-sm">此操作不可撤销！</span>
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    删除中...
                  </>
                ) : (
                  <>
                    🗑️ 确认删除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 