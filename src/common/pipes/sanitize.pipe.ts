import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sanitizeHtml = require('sanitize-html') as (dirty: string, options?: object) => string;

const MAX_DEPTH = 20;

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    return this.sanitize(value, new WeakSet(), 0);
  }

  private sanitize(value: unknown, seen: WeakSet<object>, depth: number): unknown {
    if (depth > MAX_DEPTH) {
      return value;
    }
    if (typeof value === 'string') {
      return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
    }
    if (Array.isArray(value)) {
      if (seen.has(value)) return value;
      seen.add(value);
      return value.map((v) => this.sanitize(v, seen, depth + 1));
    }
    if (value && typeof value === 'object') {
      // Express request/response objects are huge and circular; never sanitize them.
      if (value instanceof IncomingMessage || value instanceof ServerResponse) {
        return value;
      }
      if (seen.has(value)) return value;
      seen.add(value);
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.sanitize(val, seen, depth + 1);
      }
      return result;
    }
    return value;
  }
}