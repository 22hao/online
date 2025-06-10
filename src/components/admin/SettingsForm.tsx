'use client'

import { useState } from 'react'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminName: string
  adminEmail: string
  socialLinks: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'On Sre',
    siteDescription: 'SRE 技术博客 - 专注于运维、监控、自动化和可靠性工程',
    siteUrl: 'https://onsre.com',
    adminName: '管理员',
    adminEmail: 'admin@onsre.com',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: ''
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // 这里可以添加API调用来保存设置
      // const response = await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) })
      
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage('设置已成功保存！')
    } catch {
      setError('保存设置时出现错误，请重试')
    } finally {
      setIsLoading(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 站点基本信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">站点基本信息</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                站点名称
              </label>
              <input
                type="text"
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入站点名称"
              />
            </div>

            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
                站点描述
              </label>
              <textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="简短描述你的站点"
              />
            </div>

            <div>
              <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                站点URL
              </label>
              <input
                type="url"
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* 管理员信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">管理员信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                管理员名称
              </label>
              <input
                type="text"
                id="adminName"
                value={settings.adminName}
                onChange={(e) => setSettings(prev => ({ ...prev, adminName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入管理员名称"
              />
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                管理员邮箱
              </label>
              <input
                type="email"
                id="adminEmail"
                value={settings.adminEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
          </div>
        </div>

        {/* 社交媒体链接 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">社交媒体链接</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                id="github"
                value={settings.socialLinks.github || ''}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                Twitter / X
              </label>
              <input
                type="url"
                id="twitter"
                value={settings.socialLinks.twitter || ''}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                value={settings.socialLinks.linkedin || ''}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* SEO 设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SEO 设置</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">SEO 优化建议</h3>
                  <div className="text-blue-800 space-y-2">
                    <p>• 站点名称应简洁明了，包含主要关键词</p>
                    <p>• 站点描述建议 120-160 字符，突出站点特色</p>
                    <p>• 确保所有链接都是有效的 HTTPS 链接</p>
                    <p>• 社交媒体链接有助于提升站点权威性</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            所有设置将立即生效
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  )
} 