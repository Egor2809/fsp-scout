import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

export class Problem extends HttpException {
  constructor(status: number, code: string, title: string, extra: Record<string, unknown> = {}) {
    super({ type: `https://scout.local/problems/${code.replaceAll('_', '-')}`, title, status, code, ...extra }, status);
  }
}

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const parserType = error && typeof error === 'object' && 'type' in error ? error.type : null;
    const problem = parserType === 'entity.too.large' ? new Problem(413, 'file_too_large', 'Запрос слишком большой')
      : parserType === 'entity.parse.failed' ? new Problem(400, 'bad_request', 'Некорректный JSON')
      : error instanceof Problem ? error : error instanceof HttpException
      ? new Problem(error.getStatus(), error.getStatus() === 404 ? 'not_found' : error.getStatus() === 413 ? 'file_too_large' : 'bad_request', 'Ошибка запроса')
      : new Problem(500, 'internal_error', 'Внутренняя ошибка сервера');
    response.status(problem.getStatus()).type('application/problem+json').send(problem.getResponse());
  }
}
