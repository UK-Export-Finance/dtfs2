import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super({
      status: HttpStatusCode.NotFound,
      message,
    });

    this.name = this.constructor.name;
  }
}
