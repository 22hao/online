'use client'

import { useState, useCallback } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { EditorState } from 'lexical'
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'

import ToolbarPlugin from './ToolbarPlugin'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'text-gray-400',
  paragraph: 'mb-3',
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-bold mb-3',
    h3: 'text-xl font-bold mb-2',
    h4: 'text-lg font-bold mb-2',
    h5: 'text-base font-bold mb-1',
    h6: 'text-sm font-bold mb-1',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside',
    ul: 'list-disc list-inside',
    listitem: 'mb-1',
  },
  image: 'max-w-full h-auto',
  link: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 px-1 py-0.5 rounded font-mono text-sm',
  },
  code: 'bg-gray-100 p-4 rounded-lg font-mono text-sm block',
  codeHighlight: {
    atrule: 'text-purple-600',
    attr: 'text-blue-600',
    boolean: 'text-red-600',
    builtin: 'text-purple-600',
    cdata: 'text-gray-500',
    char: 'text-green-600',
    class: 'text-yellow-600',
    'class-name': 'text-yellow-600',
    comment: 'text-gray-500 italic',
    constant: 'text-red-600',
    deleted: 'text-red-600',
    doctype: 'text-gray-500',
    entity: 'text-red-600',
    function: 'text-blue-600',
    important: 'text-red-600',
    inserted: 'text-green-600',
    keyword: 'text-purple-600',
    namespace: 'text-purple-600',
    number: 'text-red-600',
    operator: 'text-gray-700',
    prolog: 'text-gray-500',
    property: 'text-blue-600',
    punctuation: 'text-gray-700',
    regex: 'text-green-600',
    selector: 'text-yellow-600',
    string: 'text-green-600',
    symbol: 'text-red-600',
    tag: 'text-red-600',
    url: 'text-blue-600',
    variable: 'text-yellow-600',
  },
}

function onError(error: Error) {
  console.error(error)
}

export default function RichTextEditor({ value, onChange, placeholder = '开始写作...' }: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
  }

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        // 这里可以根据需要转换为HTML或Markdown
        // 暂时直接序列化为JSON，后续可以改为HTML或Markdown
        const markdown = $convertToMarkdownString(TRANSFORMERS)
        onChange(markdown)
      })
    },
    [onChange]
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[400px] p-6 outline-none resize-none text-base leading-relaxed"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
                    {placeholder}
                  </div>
                }
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </LexicalComposer>
    </div>
  )
} 