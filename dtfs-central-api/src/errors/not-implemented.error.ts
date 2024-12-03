import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class NotImplementedError extends ApiError {
  constructor(message: string = 'Not implemented') {
    super({
      status: HttpStatusCode.NotImplemented,
      message,
    });

    this.name = this.constructor.name;
  }
}
