"""Bounded text-only extraction; receives PDF bytes on stdin, never writes the resume."""
import io
import sys
from pypdf import PdfReader

try:
    data = sys.stdin.buffer.read(5 * 1024 * 1024 + 1)
    if len(data) > 5 * 1024 * 1024 or not data.startswith(b'%PDF-'):
        raise ValueError('invalid input')
    reader = PdfReader(io.BytesIO(data), strict=True)
    if reader.is_encrypted or len(reader.pages) > 50:
        raise ValueError('unsupported document')
    parts = []
    length = 0
    for page in reader.pages:
        text = page.extract_text() or ''
        length += len(text)
        if length > 100000:
            raise ValueError('text limit')
        parts.append(text)
    sys.stdout.buffer.write('\n'.join(parts).encode('utf-8'))
except Exception:
    # Do not expose parser errors containing document content or paths.
    sys.exit(2)
