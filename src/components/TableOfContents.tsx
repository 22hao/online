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
      // 解析 Markdown 内容中的标题
      const markdownHeadingRegex = /^(#{1,6})\s+(.+)$/gm
      let match

      while ((match = markdownHeadingRegex.exec(content)) !== null) {
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
    return null
  }

  return (
    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          📋 目录大纲
        </h3>
        <nav className="space-y-1">
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`
                block w-full text-left text-sm transition-colors hover:text-blue-600
                ${item.level === 1 ? 'font-medium text-gray-900' : ''}
                ${item.level === 2 ? 'text-gray-700 pl-3' : ''}
                ${item.level === 3 ? 'text-gray-600 pl-6' : ''}
                ${item.level === 4 ? 'text-gray-500 pl-9' : ''}
                ${item.level === 5 ? 'text-gray-500 pl-12' : ''}
                ${item.level === 6 ? 'text-gray-500 pl-15' : ''}
                ${activeId === item.id ? 'text-blue-600 font-medium' : ''}
              `}
            >
              <span className="py-1 px-2 rounded hover:bg-gray-100 block">
                {item.text}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
} 