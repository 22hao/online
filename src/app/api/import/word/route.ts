import { NextRequest, NextResponse } from 'next/server'
const mammoth = require('mammoth')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    console.log('=== Word导入开始 ===')
    console.log('文件名:', file.name)
    console.log('文件大小:', file.size, 'bytes')
    console.log('文件类型:', file.type)

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      return NextResponse.json({ error: '只支持 .doc 和 .docx 格式的Word文档' }, { status: 400 })
    }

    // 检查文件大小（提高到50MB）
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过50MB' }, { status: 400 })
    }

    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('Buffer创建成功，长度:', buffer.length)
    
    let content = ''
    let warnings: any[] = []
    let method = ''
    
    try {
      // 方法1: 完整HTML解析（保留图片和格式）
      console.log('方法1: 尝试完整HTML解析...')
      const htmlResult = await mammoth.convertToHtml(buffer, {
        includeDefaultStyleMap: true,
        // 处理图片 - 转换为base64内嵌
        convertImage: mammoth.images.imgElement(function(image: any) {
          return image.read().then(function(imageBuffer: any) {
            const base64 = imageBuffer.toString('base64')
            const contentType = image.contentType || 'image/png'
            return {
              src: `data:${contentType};base64,${base64}`
            }
          })
        }),
        // 增强的样式映射，特别关注表格
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh", 
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='标题 1'] => h1:fresh",
          "p[style-name='标题 2'] => h2:fresh",
          "p[style-name='标题 3'] => h3:fresh",
          "r[style-name='强调'] => strong",
          "table => table.word-table",
          "tr => tr",
          "td => td",
          "th => th"
        ],
        // 转换选项
        transformDocument: function(document: any) {
          return document;
        }
      })
      
      content = htmlResult.value
      warnings = htmlResult.messages || []
      method = '完整HTML解析'
      console.log('完整HTML解析成功，内容长度:', content.length)
      
      // 检查内容质量而不是长度
      if (!content || content.trim().length < 100) {
        console.log('HTML内容质量不佳，尝试备用方法...')
        throw new Error('HTML内容质量不佳，尝试其他方法')
      }
      
    } catch (htmlError) {
      console.log('完整HTML解析失败:', htmlError)
      
      try {
        // 方法2: HTML解析（忽略图片，保留表格）
        console.log('方法2: 尝试HTML解析（忽略图片）...')
        const htmlResult = await mammoth.convertToHtml(buffer, {
          includeDefaultStyleMap: true,
          convertImage: mammoth.images.imgElement(function() {
            return { src: '[图片]' }
          }),
          styleMap: [
            "table => table.word-table",
            "tr => tr", 
            "td => td",
            "th => th"
          ]
        })
        
        content = htmlResult.value
        warnings = htmlResult.messages || []
        method = 'HTML解析（无图片）'
        console.log('HTML解析成功，内容长度:', content.length)
        
      } catch (htmlError2) {
        console.log('HTML解析失败，尝试纯文本:', htmlError2)
        
        try {
          // 方法3: 纯文本提取（保持段落结构）
          console.log('方法3: 尝试纯文本提取...')
          const textResult = await mammoth.extractRawText(buffer)
          const plainText = textResult.value
          
          console.log('纯文本长度:', plainText ? plainText.length : 0)
          
          if (plainText && plainText.trim().length > 0) {
            // 更好的段落处理 - 保持空行和格式
            const lines = plainText.split('\n')
            const processedLines = []
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]
              if (line.trim() === '') {
                // 空行转为<br>
                processedLines.push('<br>')
              } else {
                // 非空行包装为段落
                processedLines.push(`<p>${line.trim()}</p>`)
              }
            }
            
            content = processedLines.join('\n')
            warnings = textResult.messages || []
            method = '纯文本提取（保持格式）'
            console.log('纯文本提取成功')
          } else {
            throw new Error('纯文本提取结果为空')
          }
        } catch (textError) {
          console.error('所有解析方法都失败:', textError)
          return NextResponse.json({ 
            error: '文档解析失败，可能是文档格式不支持、文档损坏或包含不支持的内容',
            details: '尝试了多种解析方法都失败了'
          }, { status: 400 })
        }
      }
    }

    console.log('解析完成')
    console.log('使用方法:', method)
    console.log('最终内容长度:', content.length)
    console.log('内容预览:', content.substring(0, 500))
    console.log('警告数量:', warnings.length)

    // 检查解析结果
    if (!content || content.trim().length < 10) {
      console.error('解析结果无效:', content)
      return NextResponse.json({ 
        error: '文档解析失败，文档可能为空或包含的都是不支持的内容',
        details: `解析方法: ${method}, 内容长度: ${content.length}`
      }, { status: 400 })
    }

    // 大幅提高内容长度限制（10MB字符，支持超大文档）
    const maxContentLength = 10 * 1024 * 1024 // 10MB
    if (content.length > maxContentLength) {
      console.log('内容过长，进行智能截断')
      // 智能截断 - 尝试在段落边界截断
      let truncatedContent = content.substring(0, maxContentLength)
      const lastParagraphEnd = truncatedContent.lastIndexOf('</p>')
      const lastTableEnd = truncatedContent.lastIndexOf('</table>')
      const lastBreak = truncatedContent.lastIndexOf('<br>')
      
      // 选择最佳截断点
      const cutPoint = Math.max(lastParagraphEnd, lastTableEnd, lastBreak)
      if (cutPoint > maxContentLength * 0.8) { // 如果截断点不会丢失太多内容
        truncatedContent = content.substring(0, cutPoint + (cutPoint === lastParagraphEnd ? 4 : cutPoint === lastTableEnd ? 8 : 4))
      }
      
      content = truncatedContent + '\n\n<div style="color: orange; font-weight: bold; padding: 10px; border: 1px solid orange; margin: 10px 0;">[文档内容过长已截断，建议将大文档分割为多个小文档导入]</div>'
    }

    // 统计表格数量
    const tableCount = (content.match(/<table/g) || []).length
    console.log('检测到表格数量:', tableCount)

    return NextResponse.json({
      content: content,
      warnings: warnings.length > 0 ? warnings.map((w: any) => w.message) : undefined,
      message: `文档导入成功 (${method})${tableCount > 0 ? `, 包含${tableCount}个表格` : ''}`,
      stats: {
        originalSize: file.size,
        contentLength: content.length,
        warningCount: warnings.length,
        tableCount: tableCount,
        method: method
      }
    })

  } catch (error) {
    console.error('=== Word导入失败 ===')
    console.error('错误:', error)
    console.error('堆栈:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '文档导入失败，请检查文件格式'
    }, { status: 500 })
  }
} 