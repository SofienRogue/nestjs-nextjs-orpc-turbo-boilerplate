import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe to parse JSON data from FormData
 * Useful when sending JSON data alongside file uploads
 */
@Injectable()
export class ParseFormdataPipe implements PipeTransform {
  transform(value: any) {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      throw new BadRequestException('Invalid JSON data in FormData');
    }
  }
}
