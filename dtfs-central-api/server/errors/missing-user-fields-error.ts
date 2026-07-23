import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class MissingUserFieldsError extends ApiError {
  constructor(userId: string) {
    super({
      status: HttpStatusCode.BadRequest,
      message: `Missing required user fields for user ${userId}`,
    });
  }
}
