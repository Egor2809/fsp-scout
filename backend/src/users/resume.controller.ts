import { Controller, HttpCode, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { extractResume, ResumeExtractionError } from './resume-extractor.js';
import { parseResumeText } from './resume-parser.js';

@Controller('me')
@UseGuards(AuthGuard)
export class ResumeController {
  constructor(private readonly db: Database) {}
  @Post('resume') @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 } }))
  async upload(@Req() req: { identity: Identity }, @UploadedFile() file?: { buffer: Buffer; mimetype: string; originalname: string }) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const candidate = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } }, select: { id: true } });
    if (!candidate) throw new Problem(404, 'not_found', 'Профиль не найден');
    if (!await this.db.consent.findFirst({ where: { candidateId: candidate.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
    if (!file) throw new Problem(422, 'validation_error', 'Прикрепите PDF', { errors: [{ pointer: '/file', detail: 'Файл обязателен' }] });
    if (file.mimetype !== 'application/pdf' || file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Problem(415, 'unsupported_media_type', 'Нужен PDF');
    let text: string;
    try { text = await extractResume(file.buffer); }
    catch (error) {
      if (error instanceof ResumeExtractionError && error.reason === 'busy') throw new Problem(429, 'rate_limited', 'Обработчик занят, повторите позже');
      if (error instanceof ResumeExtractionError && error.reason === 'unavailable') throw new Problem(500, 'internal_error', 'Обработчик PDF недоступен');
      throw new Problem(422, 'validation_error', 'Не удалось прочитать PDF', { errors: [{ pointer: '/file', detail: 'Проверьте файл: до 50 страниц, без пароля и повреждений' }] });
    }
    return { resume_id: randomUUID(), file_name: file.originalname.replace(/[\u0000-\u001f\u007f/\\]/g, '_').slice(0, 255),
      uploaded_at: new Date().toISOString(), ...parseResumeText(text) };
  }
}
