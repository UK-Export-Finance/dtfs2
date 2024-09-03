import { HttpStatusCode } from 'axios';
import { ApiError } from '../errors';

export class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? HttpStatusCode.InternalServerError, message: message ?? '' });
  }
}
