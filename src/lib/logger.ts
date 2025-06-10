type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: any
  userId?: string
  ip?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // 内存中最多保存1000条日志

  private formatMessage(level: LogLevel, message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    }
  }

  info(message: string, meta?: any) {
    const entry = this.formatMessage('info', message, meta)
    this.addLog(entry)
    console.log(`[INFO] ${entry.timestamp}: ${message}`, meta || '')
  }

  warn(message: string, meta?: any) {
    const entry = this.formatMessage('warn', message, meta)
    this.addLog(entry)
    console.warn(`[WARN] ${entry.timestamp}: ${message}`, meta || '')
  }

  error(message: string, meta?: any) {
    const entry = this.formatMessage('error', message, meta)
    this.addLog(entry)
    console.error(`[ERROR] ${entry.timestamp}: ${message}`, meta || '')
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatMessage('debug', message, meta)
      this.addLog(entry)
      console.debug(`[DEBUG] ${entry.timestamp}: ${message}`, meta || '')
    }
  }

  // 记录管理员操作
  adminAction(action: string, userId: string, details?: any, ip?: string) {
    this.info(`Admin Action: ${action}`, { userId, details, ip, type: 'admin_action' })
  }

  // 记录安全事件
  securityEvent(event: string, details: any, ip?: string) {
    this.warn(`Security Event: ${event}`, { ...details, ip, type: 'security' })
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift() // 移除最旧的日志
    }
  }

  // 获取最近的日志（管理员查看用）
  getRecentLogs(limit = 50, level?: LogLevel): LogEntry[] {
    let filtered = this.logs
    if (level) {
      filtered = this.logs.filter(log => log.level === level)
    }
    return filtered.slice(-limit).reverse()
  }

  // 获取管理员操作日志
  getAdminLogs(limit = 50): LogEntry[] {
    return this.logs
      .filter(log => log.meta?.type === 'admin_action')
      .slice(-limit)
      .reverse()
  }

  // 获取安全事件日志
  getSecurityLogs(limit = 50): LogEntry[] {
    return this.logs
      .filter(log => log.meta?.type === 'security')
      .slice(-limit)
      .reverse()
  }
}

export const logger = new Logger()

// 全局错误处理包装器
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.error(`Error in ${context}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        args: args.length > 0 ? args : undefined
      })
      throw error
    }
  }
} 