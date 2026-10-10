import { translit } from '../data/names'

/**
 * Минимальный PDF для мок-режима (на бэкенде PDF-профиль собирает WeasyPrint с кириллицей и QR).
 * Стандартный шрифт Helvetica не содержит кириллицы, поэтому текст транслитерируется.
 */
function escapePdf(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function toAscii(text: string): string {
  return translit(text)
    .replace(/[«»]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
}

export function buildPdf(lines: { text: string; size?: number; gap?: number }[]): Blob {
  let y = 790
  const ops: string[] = ['BT']
  for (const line of lines) {
    const size = line.size ?? 11
    y -= line.gap ?? size + 8
    ops.push(`/F1 ${size} Tf`, `1 0 0 1 56 ${y} Tm`, `(${escapePdf(toAscii(line.text))}) Tj`)
  }
  ops.push('ET')
  const content = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Blob([pdf], { type: 'application/pdf' })
}
