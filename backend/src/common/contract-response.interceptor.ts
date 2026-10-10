import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { map } from 'rxjs';
import type { ZodType } from 'zod';
import contract from '../contract/openapi.json' with { type: 'json' };
import * as schemas from '../contract/schemas.js';
import { Problem } from './problem.js';

const routes = Object.entries(contract.paths).flatMap(([path, item]) => Object.entries(item).filter(([method]) => ['get', 'post', 'put', 'patch', 'delete'].includes(method)).map(([method, op]) => ({
  method: method.toUpperCase(), path, match: new RegExp(`^${path.split('/').map(part => part.startsWith('{') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/')}/?$`),
  operation: op as { operationId: string; responses: Record<string, unknown> },
}))).sort((a, b) => Number(a.path.includes('{')) - Number(b.path.includes('{')));

/** Enforce the client JSON response shape; integration tests still verify semantics. */
@Injectable()
export class ContractResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest(), response = context.switchToHttp().getResponse();
    const path = new URL(request.originalUrl, 'http://scout.local').pathname.replace(/^\/api\/v1(?=\/|$)/, '') || '/';
    const route = routes.find(r => r.method === request.method && r.match.test(path));
    return next.handle().pipe(map((data: unknown) => {
      if (!route) return data;
      if (!(String(response.statusCode) in route.operation.responses)) throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
      const declared = route.operation.responses[String(response.statusCode)] as { content?: Record<string, unknown> };
      if (response.statusCode === 204) {
        if (data !== undefined && data !== null) throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
        return undefined;
      }
      if (data === undefined && declared.content && Object.keys(declared.content).length) throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
      const mediaType = String(response.getHeader('Content-Type') ?? '').split(';')[0]!.trim().toLowerCase();
      if (data instanceof StreamableFile || mediaType === 'application/pdf') {
        const fileType = data instanceof StreamableFile ? data.getHeaders().type?.split(';')[0]?.trim().toLowerCase() : null;
        if (!(data instanceof StreamableFile) || fileType !== 'application/pdf' || !declared.content?.['application/pdf']
          || (mediaType && mediaType !== 'application/pdf')) throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
        return data;
      }
      if (mediaType === 'text/csv') {
        if (!declared.content?.['text/csv'] || typeof data !== 'string') throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
        return data;
      }
      const name = route.operation.operationId[0]!.toUpperCase() + route.operation.operationId.slice(1) + 'Response';
      const validator = (schemas as unknown as Record<string, ZodType | undefined>)[name];
      if (!validator) return data; // Binary endpoints and response-less operations are tested separately.
      const parsed = validator.safeParse(data);
      if (!parsed.success) {
        console.error(JSON.stringify({ event: 'contract.response.invalid', operation: route.operation.operationId,
          fields: parsed.error.issues.map(x => x.path.map(String).join('/')) }));
        throw new Problem(500, 'internal_error', 'Ответ API не соответствует контракту');
      }
      return parsed.data;
    }));
  }
}
