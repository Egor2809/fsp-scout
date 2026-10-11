"""Собирает docs/scout-documentation.pdf из markdown-документов репозитория.

Запуск из корня репозитория (нужен пакет markdown и Google Chrome):
    python3 scripts/presentation/build_docs_pdf.py docs/scout-documentation.pdf
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[2]
DOCS = ['technical-guide.md', 'local-deployment.md', 'public-deployment.md', 'matching.md', 'validation.md']
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

CSS = """
body{font-family:-apple-system,Helvetica,Arial;font-size:10.5pt;line-height:1.45;color:#111;margin:0 8mm}
h1{font-size:20pt;border-bottom:2px solid #520977;padding-bottom:4px}
h2{font-size:14pt;margin-top:18px}h3{font-size:12pt}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:9pt}
td,th{border:1px solid #bbb;padding:3px 6px;vertical-align:top}th{background:#f1e9f6}
code{background:#f3f3f3;padding:0 3px;font-size:9pt}pre{background:#f6f6f6;padding:8px;white-space:pre-wrap;font-size:8.5pt}
.pb{page-break-after:always}.cover{text-align:center;margin-top:35%}.cover h1{border:0;font-size:30pt}
"""
COVER = ('<div class="cover"><h1>Скаут</h1><p>Платформа обратного найма ИТ-специалистов '
         'с верифицированным профилем ФСП</p><p>Спецтрек ФСП · ЛЦТ 2026 · Техническая документация</p>'
         '<p>Репозиторий: github.com/Egor2809/fsp-scout</p></div><div class="pb"></div>')


def main(out):
    parts = [markdown.markdown((ROOT / 'docs' / name).read_text(encoding='utf-8'), extensions=['tables', 'fenced_code'])
             for name in DOCS]
    html = (f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{COVER}'
            + '<div class="pb"></div>'.join(parts) + '</body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / 'doc.html'
        page.write_text(html, encoding='utf-8')
        subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-pdf-header-footer',
                        f'--print-to-pdf={Path(out).resolve()}', page.as_uri()], check=True, capture_output=True)


if __name__ == '__main__':
    main(sys.argv[1])
