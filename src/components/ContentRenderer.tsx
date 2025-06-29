'use client'

import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react'

interface ContentRendererProps {
  content: string
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isHtmlContent = (text: string): boolean => {
    const htmlRegex = /<[^>]+>/
    return htmlRegex.test(text)
  }

  const isMarkdownContent = (text: string): boolean => {
    const codeBlockRegex = /```[\s\S]*?```/g
    const inlineCodeRegex = /`[^`\n]+`/g
    let textWithoutCode = text.replace(codeBlockRegex, '').replace(inlineCodeRegex, '')
    
    return /^#+\s+/m.test(textWithoutCode) ||
           text.includes('```') || 
           /^\*\s|^-\s|^\d+\.\s|^\|.*\|/m.test(textWithoutCode)
  }

  const createCodeBlock = (code: string, language: string = 'bash') => {
    return (
      <div className="enhanced-code-block">
        <div className="code-header">
          <span className="language-badge">{language}</span>
          <button 
            className="copy-btn" 
            onClick={() => navigator.clipboard.writeText(code)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="m5 15-2-2 2-2"></path>
            </svg>
            复制
          </button>
        </div>
        <pre>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    )
  }

  const addHeadingIds = (html: string): string => {
    return html.replace(/<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, tag, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim()
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      return `<${tag} id="${id}">${text}</${tag}>`
    })
  }

  const fixHtmlContent = (html: string): string => {
    let fixedHtml = html
    
    fixedHtml = fixedHtml.replace(/<div><br><\/div>/gi, '<p>&nbsp;</p>')
    
    const divCount = (fixedHtml.match(/<div[^>]*>/gi) || []).length
    const pCount = (fixedHtml.match(/<p[^>]*>/gi) || []).length
    
    if (divCount > pCount * 2) {
      fixedHtml = fixedHtml.replace(/<div([^>]*)>/gi, '<p$1>')
      fixedHtml = fixedHtml.replace(/<\/div>/gi, '</p>')
    }
    
    fixedHtml = fixedHtml.replace(/<p><\/p>/gi, '<p>&nbsp;</p>')
    fixedHtml = fixedHtml.replace(/<p>\s*<\/p>/gi, '<p>&nbsp;</p>')
    fixedHtml = fixedHtml.replace(/(<p>&nbsp;<\/p>\s*){3,}/gi, '<p>&nbsp;</p><p>&nbsp;</p>')
    fixedHtml = fixedHtml.replace(/<pre([^>]*?)>\s*<code([^>]*?)>/gi, '<pre$1><code$2>')
    fixedHtml = fixedHtml.replace(/<\/code>\s*<\/pre>/gi, '</code></pre>')
    
    return fixedHtml
  }

  // 防止SSR不匹配，只在客户端渲染内容
  if (!isClient) {
    return (
      <div className="prose prose-lg max-w-none">
        <div className="text-gray-500">Loading content...</div>
      </div>
    )
  }

  if (isHtmlContent(content)) {
    const processedHtml = addHeadingIds(fixHtmlContent(content))
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        className="prose prose-lg max-w-none"
      />
    )
  } else if (isMarkdownContent(content)) {
    return (
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          components={{
            h1: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h1 id={id}>{children}</h1>
            },
            h2: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h2 id={id}>{children}</h2>
            },
            h3: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h3 id={id}>{children}</h3>
            },
            h4: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h4 id={id}>{children}</h4>
            },
            h5: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h5 id={id}>{children}</h5>
            },
            h6: ({children}) => {
              const text = String(children)
              const id = text
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
              return <h6 id={id}>{children}</h6>
            },
            code: ({className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match
              
              if (isInline) {
                return <code className="enhanced-inline-code" {...props}>{children}</code>
              }
              
              const language = match[1] || 'bash'
              const code = String(children).replace(/\n$/, '')
              return createCodeBlock(code, language)
            },
            table: ({children}) => <table className="prose-table">{children}</table>,
            blockquote: ({children}) => <blockquote className="prose-blockquote">{children}</blockquote>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  } else {
    // 对于纯文本内容，简化处理逻辑
    const lines = content.split('\n')
    return (
      <div className="prose prose-lg max-w-none">
        {lines.map((line, index) => {
          if (line.trim() === '') {
            return <br key={index} />
          }
          return <p key={index}>{line}</p>
        })}
      </div>
    )
  }
}
