'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

interface SystemStats {
  uptime: string
  memoryUsage: string
  nodeVersion: string
  nextVersion: string
  lastRestart: string
}

export default function SystemMonitor() {
  const [logs, setLogs] = useState<any[]>([])
  const [adminLogs, setAdminLogs] = useState<any[]>([])
  const [securityLogs, setSecurityLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'admin' | 'security'>('overview')
  const [stats, setStats] = useState<SystemStats>({
    uptime: '未知',
    memoryUsage: '未知',
    nodeVersion: '未知',
    nextVersion: '未知',
    lastRestart: '未知'
  })

  useEffect(() => {
    // 获取系统信息
    setStats({
      uptime: `${Math.floor(process.uptime?.() || 0)} 秒`,
      memoryUsage: '内存使用情况',
      nodeVersion: process.version || '未知',
      nextVersion: '15.0.0', // Next.js版本
      lastRestart: new Date().toLocaleString()
    })

    // 获取日志
    setLogs(logger.getRecentLogs(50))
    setAdminLogs(logger.getAdminLogs(50))
    setSecurityLogs(logger.getSecurityLogs(50))
  }, [])

  const refreshLogs = () => {
    setLogs(logger.getRecentLogs(50))
    setAdminLogs(logger.getAdminLogs(50))
    setSecurityLogs(logger.getSecurityLogs(50))
  }

  const LogTable = ({ logs, title }: { logs: any[], title: string }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button
          onClick={refreshLogs}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          刷新
        </button>
      </div>
      
      {logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  级别
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  消息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  详情
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                      log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                      log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.meta ? (
                      <details className="cursor-pointer">
                        <summary>查看详情</summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.meta, null, 2)}
                        </pre>
                      </details>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-gray-500">
          暂无{title}记录
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '系统概览', icon: '📊' },
            { key: 'logs', label: '系统日志', icon: '📝' },
            { key: 'admin', label: '管理员操作', icon: '👤' },
            { key: 'security', label: '安全事件', icon: '🔒' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 系统概览 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">系统运行时间</p>
                <p className="text-lg font-bold text-gray-900">{stats.uptime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Node.js版本</p>
                <p className="text-lg font-bold text-gray-900">{stats.nodeVersion}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⚛️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next.js版本</p>
                <p className="text-lg font-bold text-gray-900">{stats.nextVersion}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">最后重启</p>
                <p className="text-lg font-bold text-gray-900">{stats.lastRestart}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 系统日志 */}
      {activeTab === 'logs' && (
        <LogTable logs={logs} title="系统日志" />
      )}

      {/* 管理员操作日志 */}
      {activeTab === 'admin' && (
        <LogTable logs={adminLogs} title="管理员操作日志" />
      )}

      {/* 安全事件日志 */}
      {activeTab === 'security' && (
        <LogTable logs={securityLogs} title="安全事件日志" />
      )}

      {/* 操作建议 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="p-2 bg-yellow-100 rounded-lg mr-4">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">系统维护建议</h3>
            <div className="text-yellow-800 space-y-2">
              <p>• <strong>定期检查</strong>：建议每周查看一次系统日志和安全事件</p>
              <p>• <strong>性能监控</strong>：关注错误日志，及时发现并解决问题</p>
              <p>• <strong>安全审计</strong>：定期检查管理员操作记录，确保账户安全</p>
              <p>• <strong>备份策略</strong>：建议设置定期数据备份（生产环境）</p>
              <p>• <strong>版本更新</strong>：及时更新依赖包和框架版本</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 