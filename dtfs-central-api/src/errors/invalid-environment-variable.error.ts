import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error.ts';

export class InvalidEnvironmentVariableError extends ApiError {
  constructor(message: string) {
    super({
      status: HttpStatusCode.InternalServerError,
      message,
    });

    this.name = this.constructor.name;
  }
}
