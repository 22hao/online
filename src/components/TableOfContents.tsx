'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const items: TocItem[] = []
    
    // 检测内容是否为HTML格式
    const isHtmlContent = /<[^>]+>/.test(content)
    
    if (isHtmlContent) {
      // 解析HTML中的标题
      const htmlHeadingRegex = /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi
      let match
      
      while ((match = htmlHeadingRegex.exec(content)) !== null) {
        const level = parseInt(match[1].charAt(1))
        const text = match[2].replace(/<[^>]*>/g, '').trim() // 移除内部HTML标签
        const id = text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        items.push({ id, text, level })
      }
    } else {
      // 解析 Markdown 内容中的标题，但要排除代码块内的内容
      const codeBlockRegex = /```[\s\S]*?```/g
      const inlineCodeRegex = /`[^`\n]+`/g
      let contentWithoutCodeBlocks = content.replace(codeBlockRegex, '').replace(inlineCodeRegex, '')
      
      const markdownHeadingRegex = /^(#{1,6})\s+(.+)$/gm
      let match

      while ((match = markdownHeadingRegex.exec(contentWithoutCodeBlocks)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        items.push({ id, text, level })
      }
    }

    setTocItems(items)
  }, [content])

  useEffect(() => {
    // 监听滚动，高亮当前阅读的标题
    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean)
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i]
        if (heading && heading.getBoundingClientRect().top <= 100) {
          setActiveId(heading.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  if (tocItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">暂无目录</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 目录导航 */}
      <nav className="space-y-1">
        {tocItems.map((item, index) => {
          const isActive = activeId === item.id
          const getIndentClass = (level: number) => {
            switch(level) {
              case 1: return 'pl-0'
              case 2: return 'pl-3'
              case 3: return 'pl-6'
              case 4: return 'pl-9'
              case 5: return 'pl-12'
              case 6: return 'pl-15'
              default: return 'pl-0'
            }
          }
          
          const getLevelStyles = (level: number) => {
            switch(level) {
              case 1: return 'text-sm font-medium text-gray-900'
              case 2: return 'text-sm text-gray-800'
              case 3: return 'text-xs text-gray-700'
              default: return 'text-xs text-gray-600'
            }
          }

          return (
            <div key={item.id} className={getIndentClass(item.level)}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  group relative w-full text-left py-1.5 px-2 rounded-md transition-all duration-200
                  hover:bg-blue-50 hover:text-blue-700
                  ${isActive 
                    ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500' 
                    : 'hover:border-l-2 hover:border-blue-200'
                  }
                  ${getLevelStyles(item.level)}
                `}
              >
                {/* 层级指示器和标题文本在同一行 */}
                <span className="flex items-center leading-tight">
                  {item.level > 1 && (
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-400 transition-colors flex-shrink-0"></span>
                  )}
                  <span className="truncate">
                    {item.text}
                  </span>
                </span>
              </button>
            </div>
          )
        })}
      </nav>

      {/* 简化的统计信息 */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2">
          共 {tocItems.length} 个章节 · 约 {Math.ceil(content.length / 500)} 分钟阅读
        </div>
        
        {/* 简化的进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* 简化的快捷操作 */}
      <div className="flex space-x-1">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          顶部
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          底部
        </button>
      </div>
    </div>
  )
} 