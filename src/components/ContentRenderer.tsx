'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface ContentRendererProps {
  content: string
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  // 检测内容是否为HTML格式
  const isHtmlContent = (text: string): boolean => {
    const htmlRegex = /<[^>]+>/
    return htmlRegex.test(text)
  }

  // 为HTML中的标题添加ID
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

  if (isHtmlContent(content)) {
    // 如果是HTML内容，直接渲染并添加标题ID
    const processedHtml = addHeadingIds(content)
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        className="prose-content"
      />
    )
  } else {
    // 如果是Markdown内容，使用ReactMarkdown渲染
    return (
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
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            
            return (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }
} 