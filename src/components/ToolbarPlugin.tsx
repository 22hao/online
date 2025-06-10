'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { 
  $createCodeNode,
  $isCodeNode,
} from '@lexical/code'

const LowPriority = 1

function Divider() {
  return <div className="w-px h-6 bg-gray-300 mx-2" />
}

interface ToolbarButtonProps {
  onClick: () => void
  className?: string
  isActive?: boolean
  title?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, className = '', isActive = false, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
        } ${className}
      `}
    >
      {children}
    </button>
  )
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, _newEditor) => {
        updateToolbar()
        return false
      },
      LowPriority
    )
  }, [editor, updateToolbar])

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          $setBlocksType(selection, () => $createCodeNode())
        } else {
          formatText('code')
        }
      }
    })
  }

  const insertLink = () => {
    const url = prompt('请输入链接地址:')
    if (url) {
      // TODO: 实现链接插入逻辑
      console.log('Insert link:', url)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-1">
        {/* 撤销重做 */}
        <div className="flex items-center space-x-1 mr-2">
          <ToolbarButton
            onClick={() => editor.dispatchCommand({ type: 'UNDO_COMMAND' } as any, undefined)}
            title="撤销 (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand({ type: 'REDO_COMMAND' } as any, undefined)}
            title="重做 (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
            </svg>
          </ToolbarButton>
        </div>

        <Divider />

        {/* 文字格式 */}
        <div className="flex items-center space-x-1 mr-2">
          <ToolbarButton
            onClick={() => formatText('bold')}
            isActive={isBold}
            title="加粗 (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h4.5a4 4 0 014 4 4 4 0 01-1.416 3.052A4.5 4.5 0 0114.5 15H4a1 1 0 01-1-1V4zm4 6V5h1.5a2 2 0 110 4H7zm0 2h3.5a2.5 2.5 0 110 5H7v-5z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatText('italic')}
            isActive={isItalic}
            title="斜体 (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 00-1 1v1H6a1 1 0 000 2h1v6H6a1 1 0 100 2h8a1 1 0 100-2h-1V7h1a1 1 0 100-2h-1V4a1 1 0 00-1-1H8z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatText('underline')}
            isActive={isUnderline}
            title="下划线 (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14 12V6a4 4 0 10-8 0v6a4 4 0 108 0zM4 16h12v2H4v-2z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatText('strikethrough')}
            isActive={isStrikethrough}
            title="删除线"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
        </div>

        <Divider />

        {/* 标题 */}
        <div className="flex items-center space-x-1 mr-2">
          <ToolbarButton
            onClick={() => formatHeading('h1')}
            title="一级标题"
          >
            <span className="text-xs font-bold">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatHeading('h2')}
            title="二级标题"
          >
            <span className="text-xs font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatHeading('h3')}
            title="三级标题"
          >
            <span className="text-xs font-bold">H3</span>
          </ToolbarButton>
        </div>

        <Divider />

        {/* 列表和格式 */}
        <div className="flex items-center space-x-1 mr-2">
          <ToolbarButton
            onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
            title="无序列表"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
            title="有序列表"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={formatQuote}
            title="引用"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
        </div>

        <Divider />

        {/* 插入 */}
        <div className="flex items-center space-x-1 mr-2">
          <ToolbarButton
            onClick={insertLink}
            title="插入链接"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={formatCode}
            isActive={isCode}
            title="代码"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* 右侧信息 */}
      <div className="flex items-center space-x-3 text-sm text-gray-500">
        <span>富文本编辑器</span>
      </div>
    </div>
  )
} 