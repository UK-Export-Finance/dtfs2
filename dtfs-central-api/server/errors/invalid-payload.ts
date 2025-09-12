import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidPayloadError extends ApiError {
  constructor(message: string) {
    super({
      status: HttpStatusCode.BadRequest,
      message,
    });

    this.name = this.constructor.name;
  }
}
