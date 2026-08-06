import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sanitizeHtml = require('sanitize-html') as (dirty: string, options?: object) => string;

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
    }
    return value;
  }
}
