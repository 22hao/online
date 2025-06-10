'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// 动态导入避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import '@uiw/react-md-editor/markdown-editor.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown'>('rich') // 默认富文本模式

  // 添加自定义字体到 Quill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Quill = require('react-quill').Quill
      
      // 自定义字体大小
      const Size = Quill.import('formats/size')
      Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px']
      Quill.register(Size, true)
    }
  }, [])

  // 简单的 HTML 到 Markdown 转换（当从富文本切换到MD时）
  const htmlToMarkdown = (html: string): string => {
    if (!html) return ''
    
    // 移除HTML标签，保留基本格式
    let markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p><p[^>]*>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '') // 移除剩余的HTML标签
      .trim()
    
    return markdown
  }

  // 简单的 Markdown 到 HTML 转换（当从MD切换到富文本时）
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return ''
    
    let html = markdown
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
    
    return `<p>${html}</p>`.replace('<p></p>', '')
  }

  // 切换编辑器模式
  const toggleEditorMode = () => {
    if (editorMode === 'rich') {
      // 从富文本切换到MD，将HTML转换为Markdown
      const markdown = htmlToMarkdown(value)
      onChange(markdown)
      setEditorMode('markdown')
    } else {
      // 从MD切换到富文本，将Markdown转换为HTML  
      const html = markdownToHtml(value)
      onChange(html)
      setEditorMode('rich')
    }
  }

  // 富文本编辑器配置
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // 标题选择器
      [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'] }], // 字体大小
      ['bold', 'italic', 'underline', 'strike'], // 基本格式
      [{ 'color': [] }, { 'background': [] }], // 字体颜色和背景色
      [{ 'script': 'sub'}, { 'script': 'super' }], // 上标下标
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 列表
      [{ 'indent': '-1'}, { 'indent': '+1' }], // 缩进
      [{ 'align': [] }], // 对齐
      ['blockquote', 'code-block'], // 引用和代码块
      ['link', 'image'], // 链接、图片
      ['clean'] // 清除格式
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'size',
    'color', 'background', 'script', 'blockquote', 'code-block', 
    'list', 'bullet', 'indent', 'align', 'link', 'image'
  ]

  // 获取当前显示的内容
  const getCurrentContent = () => {
    if (editorMode === 'rich') {
      return value
    } else {
      return value
    }
  }

  return (
    <>
      {/* 自定义样式 */}
      <style jsx global>{`
        .ql-size-10px {
          font-size: 10px;
        }
        .ql-size-12px {
          font-size: 12px;
        }
        .ql-size-14px {
          font-size: 14px;
        }
        .ql-size-16px {
          font-size: 16px;
        }
        .ql-size-18px {
          font-size: 18px;
        }
        .ql-size-20px {
          font-size: 20px;
        }
        .ql-size-24px {
          font-size: 24px;
        }
        .ql-size-32px {
          font-size: 32px;
        }

        /* 标题选择器样式 */
        .ql-header .ql-picker-label::before,
        .ql-header .ql-picker-item::before {
          content: "正文" !important;
        }
        .ql-header .ql-picker-label[data-value="1"]::before,
        .ql-header .ql-picker-item[data-value="1"]::before {
          content: "标题 1" !important;
        }
        .ql-header .ql-picker-label[data-value="2"]::before,
        .ql-header .ql-picker-item[data-value="2"]::before {
          content: "标题 2" !important;
        }
        .ql-header .ql-picker-label[data-value="3"]::before,
        .ql-header .ql-picker-item[data-value="3"]::before {
          content: "标题 3" !important;
        }
        .ql-header .ql-picker-label[data-value="4"]::before,
        .ql-header .ql-picker-item[data-value="4"]::before {
          content: "标题 4" !important;
        }
        .ql-header .ql-picker-label[data-value="5"]::before,
        .ql-header .ql-picker-item[data-value="5"]::before {
          content: "标题 5" !important;
        }
        .ql-header .ql-picker-label[data-value="6"]::before,
        .ql-header .ql-picker-item[data-value="6"]::before {
          content: "标题 6" !important;
        }

        /* 字体大小选择器样式 */
        .ql-size .ql-picker-label::before,
        .ql-size .ql-picker-item::before {
          content: "16px" !important;
        }
        .ql-size .ql-picker-label[data-value="10px"]::before,
        .ql-size .ql-picker-item[data-value="10px"]::before {
          content: "10px" !important;
        }
        .ql-size .ql-picker-label[data-value="12px"]::before,
        .ql-size .ql-picker-item[data-value="12px"]::before {
          content: "12px" !important;
        }
        .ql-size .ql-picker-label[data-value="14px"]::before,
        .ql-size .ql-picker-item[data-value="14px"]::before {
          content: "14px" !important;
        }
        .ql-size .ql-picker-label[data-value="16px"]::before,
        .ql-size .ql-picker-item[data-value="16px"]::before {
          content: "16px" !important;
        }
        .ql-size .ql-picker-label[data-value="18px"]::before,
        .ql-size .ql-picker-item[data-value="18px"]::before {
          content: "18px" !important;
        }
        .ql-size .ql-picker-label[data-value="20px"]::before,
        .ql-size .ql-picker-item[data-value="20px"]::before {
          content: "20px" !important;
        }
        .ql-size .ql-picker-label[data-value="24px"]::before,
        .ql-size .ql-picker-item[data-value="24px"]::before {
          content: "24px" !important;
        }
        .ql-size .ql-picker-label[data-value="32px"]::before,
        .ql-size .ql-picker-item[data-value="32px"]::before {
          content: "32px" !important;
        }

        /* 工具栏优化 */
        .ql-toolbar {
          padding: 8px !important;
          border-bottom: 1px solid #ddd !important;
        }
        .ql-toolbar .ql-picker.ql-header {
          width: 70px !important;
        }
        .ql-toolbar .ql-picker.ql-size {
          width: 55px !important;
        }
        .ql-toolbar .ql-picker-label {
          padding: 2px 4px !important;
          font-size: 12px !important;
          line-height: 1.3 !important;
          border: none !important;
          background: none !important;
        }
        .ql-toolbar .ql-picker-options {
          font-size: 12px !important;
        }
        .ql-toolbar .ql-formats {
          margin-right: 8px !important;
        }
        
        /* 设置默认字体 */
        .ql-editor {
          font-family: "SimSun", "宋体", serif !important;
          font-size: 16px !important;
        }

        /* MD编辑器优化样式 */
        .w-md-editor {
          background-color: #fafafa !important;
        }
        .w-md-editor-text-pre, 
        .w-md-editor-text-input, 
        .w-md-editor-text {
          font-size: 14px !important;
          line-height: 1.6 !important;
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace !important;
          color: #2c3e50 !important;
        }
        .w-md-editor-preview {
          background-color: #ffffff !important;
          padding: 16px !important;
        }
        .w-md-editor-text-container {
          background-color: #ffffff !important;
        }
        
        /* 工具栏优化 */
        .w-md-editor-toolbar {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
          padding: 8px 12px !important;
          min-height: 40px !important;
        }
        .w-md-editor-toolbar-child button {
          background: transparent !important;
          border: none !important;
          color: #6c757d !important;
          font-size: 14px !important;
          padding: 4px 6px !important;
          margin: 0 2px !important;
          border-radius: 3px !important;
          transition: all 0.2s ease !important;
        }
        .w-md-editor-toolbar-child button:hover {
          background-color: #e9ecef !important;
          color: #495057 !important;
        }
        .w-md-editor-toolbar-child button.active {
          background-color: #007bff !important;
          color: white !important;
        }
        
        /* 分割线样式 */
        .w-md-editor-toolbar-divider {
          background-color: #dee2e6 !important;
          width: 1px !important;
          margin: 0 8px !important;
        }
        
        /* 编辑区域边框 */
        .w-md-editor {
          border: 1px solid #e9ecef !important;
          border-radius: 6px !important;
          overflow: hidden !important;
        }
        
        /* 状态栏 */
        .w-md-editor-bar {
          background-color: #f8f9fa !important;
          border-top: 1px solid #e9ecef !important;
          color: #6c757d !important;
          font-size: 12px !important;
          padding: 4px 12px !important;
        }
        
        /* 预览区域样式 */
        .w-md-editor-preview h1,
        .w-md-editor-preview h2,
        .w-md-editor-preview h3,
        .w-md-editor-preview h4,
        .w-md-editor-preview h5,
        .w-md-editor-preview h6 {
          color: #2c3e50 !important;
          margin-top: 24px !important;
          margin-bottom: 16px !important;
        }
        .w-md-editor-preview p {
          color: #2c3e50 !important;
          line-height: 1.6 !important;
          margin-bottom: 16px !important;
        }
        .w-md-editor-preview code {
          background-color: #f1f3f4 !important;
          color: #d73a49 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          font-size: 13px !important;
        }
        .w-md-editor-preview pre {
          background-color: #f6f8fa !important;
          border: 1px solid #e1e4e8 !important;
          border-radius: 6px !important;
          padding: 16px !important;
          overflow-x: auto !important;
        }
        .w-md-editor-preview blockquote {
          border-left: 4px solid #dfe2e5 !important;
          padding-left: 16px !important;
          color: #6a737d !important;
          background-color: #f6f8fa !important;
          margin: 0 0 16px 0 !important;
          padding: 8px 16px !important;
        }
      `}</style>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* 编辑器切换按钮 */}
        <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {editorMode === 'rich' ? '富文本编辑器' : 'Markdown 编辑器'}
          </div>
          <button
            type="button"
            onClick={toggleEditorMode}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {editorMode === 'rich' ? '使用 MD 编辑器' : '使用富文本编辑器'}
          </button>
        </div>

        {/* 编辑器内容 */}
        <div className="min-h-96">
          {editorMode === 'rich' ? (
            <div style={{ height: '500px' }}>
              <ReactQuill
                value={value}
                onChange={onChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder={placeholder || '开始写作...'}
                style={{ height: '450px' }}
                theme="snow"
              />
            </div>
          ) : (
            <MDEditor
              value={value}
              onChange={(val) => onChange(val || '')}
              preview="live"
              hideToolbar={false}
              visibleDragbar={false}
              height={500}
              data-color-mode="light"
              textareaProps={{
                placeholder: placeholder || '开始编写您的Markdown内容...',
                style: {
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  )
} 