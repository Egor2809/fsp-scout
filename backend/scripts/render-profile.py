"""Render a bounded JSON profile from stdin to PDF on stdout; no temporary PII files."""
import io
import json
import os
import sys
from html import escape
from urllib.parse import urlparse


def render(payload):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
    from reportlab.graphics.shapes import Drawing
    from reportlab.graphics.barcode.qr import QrCodeWidget

    claims = payload['claims']
    url = payload['verification_url']
    parsed = urlparse(url)
    if parsed.scheme not in ('https', 'http') or not parsed.netloc or parsed.username or parsed.password or len(url) > 1000:
        raise ValueError('Invalid verification URL')
    if claims.get('valid') is not True or not claims.get('category') or not 1 <= claims['percentile'] <= 99:
        raise ValueError('Confirmed profile required')
    font = os.environ.get('PROFILE_PDF_FONT', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    pdfmetrics.registerFont(TTFont('Scout', font))
    normal = ParagraphStyle('normal', fontName='Scout', fontSize=10, leading=15, spaceAfter=8)
    title = ParagraphStyle('title', parent=normal, fontSize=24, leading=30, spaceAfter=18)
    heading = ParagraphStyle('heading', parent=normal, fontSize=13, leading=18, spaceBefore=12)
    muted = ParagraphStyle('muted', parent=normal, fontSize=8, leading=12, textColor=colors.HexColor('#526075'))
    text = lambda value: escape(str(value)).replace('\n', '<br/>')
    profile = payload.get('profile', {})
    category = claims['category']
    story = [Paragraph('СКАУТ / Профиль специалиста', heading), Paragraph(text(claims['full_name']), title),
             Paragraph(text(category.get('label') or f"{category['specialization']} / {category['grade']}"), heading),
             Paragraph(f"Процентиль в подтверждённой категории: {int(claims['percentile'])}", normal),
             Paragraph(f"Подтверждено: {text(claims['confirmed_at'])}", normal),
             Paragraph(f"Подтверждённых достижений ФСП: {int(claims['fsp_achievements_count'])}", normal)]
    for key, label in [('city', 'Город'), ('email', 'Email'), ('phone', 'Телефон'), ('telegram', 'Telegram')]:
        if profile.get(key):
            story.append(Paragraph(f"{label}: {text(profile[key])}", normal))
    if profile.get('about'):
        story.extend([Paragraph('О себе', heading), Paragraph(text(profile['about']), normal)])
    skills = profile.get('skills', [])
    if skills:
        story.append(Paragraph('Навыки', heading))
        for skill in skills:
            mark = 'подтверждён' if skill.get('verified') else 'заявлен кандидатом'
            story.append(Paragraph(f"{text(skill['name'])} - {mark}", normal))
    for item in profile.get('experience', []):
        story.extend([Paragraph(text(item['role']), heading),
                      Paragraph(text(item.get('company_name') or 'Компания не указана'), normal),
                      Paragraph(text(f"{item['start']} - {item.get('end') or 'по настоящее время'}"), muted)])
        if item.get('description'):
            story.append(Paragraph(text(item['description']), normal))
    qr = QrCodeWidget(url, barLevel='M')
    x1, y1, x2, y2 = qr.getBounds()
    size = 38 * mm
    drawing = Drawing(size, size, transform=[size / (x2-x1), 0, 0, size / (y2-y1), 0, 0])
    drawing.add(qr)
    story.extend([Spacer(1, 10 * mm), KeepTogether([Paragraph('Проверка подтверждённых результатов', heading), drawing,
                  Paragraph(f'<link href="{escape(url, quote=True)}">Открыть проверку профиля</link>', normal),
                  Paragraph('Ссылка действительна 30 суток и может быть отозвана владельцем. Проверяйте актуальность онлайн.', muted),
                  Paragraph(f"Выдано: {text(claims['issued_at'])}", muted)])])
    output = io.BytesIO()
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Scout', 8)
        canvas.drawRightString(A4[0] - 20*mm, 12*mm, str(doc.page))
        canvas.restoreState()
    SimpleDocTemplate(output, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm,
                      bottomMargin=22*mm, title='Scout profile', author='Scout').build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()


if __name__ == '__main__':
    try:
        raw = sys.stdin.buffer.read(200001)
        if len(raw) > 200000:
            raise ValueError('Profile input too large')
        result = render(json.loads(raw))
        if len(result) > 5 * 1024 * 1024:
            raise ValueError('Profile PDF too large')
        sys.stdout.buffer.write(result)
    except Exception:
        # No profile, link token, path or subprocess traceback in logs.
        sys.stderr.write('profile_pdf_unavailable\n')
        sys.exit(1)
