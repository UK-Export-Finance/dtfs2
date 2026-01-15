import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidUserIdError extends ApiError {
  constructor(userId?: string) {
    const message = userId ? `Invalid user ID: ${userId}` : 'Invalid user ID';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidUserIdError';
  }
}
