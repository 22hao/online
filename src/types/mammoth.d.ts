declare module 'mammoth/mammoth.browser' {
  interface ConvertToHtmlOptions {
    arrayBuffer: ArrayBuffer
  }

  interface ConvertToHtmlResult {
    value: string
    messages: string[]
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>
} 