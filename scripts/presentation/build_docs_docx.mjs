// Собирает docs/scout-documentation.docx из тех же markdown-документов, что и PDF.
//
// Запуск из корня репозитория (нужны npm-пакеты docx и marked):
//   node scripts/presentation/build_docs_docx.mjs docs/scout-documentation.docx
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.join(process.env.DOCX_DEPS ?? process.cwd(), 'noop.js'));
const {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, HeadingLevel, LevelFormat,
  Packer, PageBreak, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} = require('docx');
const { marked } = require('marked');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DOCS = ['technical-guide.md', 'local-deployment.md', 'public-deployment.md', 'matching.md', 'validation.md'];
const BRAND = '402FFF';
const INK = '1B1C21';
const FONT = 'Arial';
const MONO = 'Courier New';
const CONTENT_W = 11906 - 2 * 1134; // A4, поля 2 см

let orderedInstance = 0;

// ── Строчная разметка → TextRun / ссылки ──
function inline(tokens, style = {}) {
  const out = [];
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'strong': out.push(...inline(t.tokens, { ...style, bold: true })); break;
      case 'em': out.push(...inline(t.tokens, { ...style, italics: true })); break;
      case 'del': out.push(...inline(t.tokens, { ...style, strike: true })); break;
      case 'codespan':
        out.push(new TextRun({ text: unescape(t.text), font: MONO, size: (style.size ?? 21) - 2, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F1F4' }, ...pick(style) }));
        break;
      case 'link': {
        const runs = inline(t.tokens, { ...style, color: BRAND, underline: {} });
        if (/^https?:\/\//.test(t.href)) out.push(new ExternalHyperlink({ link: t.href, children: runs }));
        else out.push(...runs);
        break;
      }
      case 'br': out.push(new TextRun({ break: 1 })); break;
      case 'image': out.push(new TextRun({ text: t.text || '', ...pick(style) })); break;
      case 'text':
        if (t.tokens?.length) out.push(...inline(t.tokens, style));
        else out.push(new TextRun({ text: unescape(t.text), ...pick(style) }));
        break;
      case 'escape': out.push(new TextRun({ text: t.text, ...pick(style) })); break;
      case 'html': break;
      default: if (t.text) out.push(new TextRun({ text: unescape(t.text), ...pick(style) }));
    }
  }
  return out;
}
const pick = (s) => ({ bold: s.bold, italics: s.italics, strike: s.strike, color: s.color, underline: s.underline, size: s.size, font: s.font });
const unescape = (s) => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const plain = (tokens) => (tokens ?? []).map((t) => (t.tokens ? plain(t.tokens) : unescape(t.text ?? ''))).join('');

// ── Блоки ──
function blocks(tokens, ctx = {}) {
  const out = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        const level = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][Math.min(t.depth, 4) - 1];
        out.push(new Paragraph({ heading: level, keepNext: true, children: inline(t.tokens) }));
        break;
      }
      case 'paragraph':
        out.push(new Paragraph({ spacing: { after: 120 }, children: inline(t.tokens) }));
        break;
      case 'list': out.push(...list(t, ctx.level ?? 0)); break;
      case 'table': out.push(table(t), new Paragraph({ spacing: { after: 60 }, children: [] })); break;
      case 'code': out.push(...code(t.text)); break;
      case 'blockquote':
        for (const p of blocks(t.tokens)) out.push(p);
        break;
      case 'hr':
        out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C8C9CA', space: 1 } }, children: [] }));
        break;
      default: break; // space, html
    }
  }
  return out;
}

function list(t, level) {
  const out = [];
  const instance = t.ordered ? ++orderedInstance : 0;
  for (const item of t.items) {
    let first = true;
    for (const sub of item.tokens) {
      if (sub.type === 'list') { out.push(...list(sub, level + 1)); continue; }
      const runs = sub.type === 'text' || sub.type === 'paragraph' ? inline(sub.tokens ?? [{ type: 'text', text: sub.text }]) : null;
      if (!runs) { out.push(...blocks([sub], { level })); continue; }
      out.push(new Paragraph({
        spacing: { after: 60 },
        numbering: first ? (t.ordered ? { reference: 'ordered', level, instance } : { reference: 'bullets', level }) : undefined,
        indent: first ? undefined : { left: 720 * (level + 1) },
        children: runs,
      }));
      first = false;
    }
  }
  return out;
}

function table(t) {
  const cols = t.header.length;
  // ширина колонок — по самой длинной строке в колонке, с разумными пределами
  const len = Array.from({ length: cols }, (_, c) => Math.max(plain(t.header[c].tokens).length, ...t.rows.map((r) => plain(r[c]?.tokens).length)));
  const weights = len.map((l) => Math.min(Math.max(l, 6), 60));
  const sum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((CONTENT_W * w) / sum));
  widths[cols - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'C8C9CA' };
  const cell = (c, i, head) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders: { top: border, bottom: border, left: border, right: border },
    shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: 'F0EEFF' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({ children: inline(c.tokens, { size: 18, bold: head || undefined }) })],
  });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: t.header.map((c, i) => cell(c, i, true)) }),
      ...t.rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}

function code(text) {
  const lines = text.replace(/\t/g, '  ').split('\n');
  return lines.map((l, i) => new Paragraph({
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F4F4F6' },
    spacing: { before: i === 0 ? 60 : 0, after: i === lines.length - 1 ? 140 : 0, line: 240 },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text: l || ' ', font: MONO, size: 17 })],
  }));
}

// ── Обложка ──
function cover() {
  const p = (text, opts = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: opts.after ?? 160 }, children: [new TextRun({ text, ...opts.run })] });
  return [
    new Paragraph({ spacing: { before: 3600 }, children: [] }),
    p('Скаут × ФСП', { run: { size: 64, bold: true, color: BRAND }, after: 240 }),
    p('Платформа обратного найма ИТ-специалистов с верифицированным профилем ФСП', { run: { size: 26, color: INK }, after: 480 }),
    p('Спецтрек ФСП · ЛЦТ 2026 · Техническая документация', { run: { size: 22, color: '555555' } }),
    p('Команда «Нулевой закон»', { run: { size: 22, color: '555555' }, after: 480 }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
      new TextRun({ text: 'Стенд: ', size: 20, color: '555555' }),
      new ExternalHyperlink({ link: 'https://scout.141.133.201.48.sslip.io', children: [new TextRun({ text: 'scout.141.133.201.48.sslip.io', size: 20, color: BRAND, underline: {} })] }),
    ] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'Репозиторий: ', size: 20, color: '555555' }),
      new ExternalHyperlink({ link: 'https://github.com/Egor2809/fsp-scout', children: [new TextRun({ text: 'github.com/Egor2809/fsp-scout', size: 20, color: BRAND, underline: {} })] }),
    ] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

const body = [];
DOCS.forEach((name, i) => {
  const md = fs.readFileSync(path.join(ROOT, 'docs', name), 'utf8').replace(/^﻿/, '');
  if (i > 0) body.push(new Paragraph({ children: [new PageBreak()] }));
  body.push(...blocks(marked.lexer(md)));
});

const bulletLevels = [0, 1, 2].map((level) => ({ level, format: LevelFormat.BULLET, text: ['•', '–', '·'][level], alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 300 } } } }));
const orderedLevels = [0, 1, 2].map((level) => ({ level, format: [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER, LevelFormat.LOWER_ROMAN][level], text: `%${level + 1}.`, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } } }));

const doc = new Document({
  creator: 'Команда «Нулевой закон»',
  title: 'Скаут × ФСП — техническая документация',
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK }, paragraph: { spacing: { line: 276 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, color: BRAND, font: FONT }, paragraph: { spacing: { before: 120, after: 200 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      { id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 21, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 3 } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: bulletLevels }, { reference: 'ordered', levels: orderedLevels }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' })] })] }) },
    children: [...cover(), ...body],
  }],
});

const out = process.argv[2] ?? 'docs/scout-documentation.docx';
fs.writeFileSync(out, await Packer.toBuffer(doc));
console.log('written', out);
