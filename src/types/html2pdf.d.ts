declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      logging?: boolean
      backgroundColor?: string
      width?: number
      [key: string]: unknown
    }
    jsPDF?: {
      unit?: string
      format?: string
      orientation?: string
      [key: string]: unknown
    }
    pagebreak?: { mode?: string[]; before?: string[]; after?: string[]; avoid?: string[] }
  }

  interface Html2PdfInstance {
    set: (opt: Html2PdfOptions) => Html2PdfInstance
    from: (element: HTMLElement) => Html2PdfInstance
    save: () => Promise<void>
    toPdf: () => Html2PdfInstance
    output: (type?: string) => Promise<unknown>
    outputPdf: (type?: string) => Promise<unknown>
  }

  function html2pdf(): Html2PdfInstance
  export default html2pdf
}