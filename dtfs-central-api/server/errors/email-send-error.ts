import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class EmailSendError extends ApiError {
  constructor(userId: string, message: string, upstreamStatus?: number) {
    super({
      status: HttpStatusCode.InternalServerError,
      message: `Failed to send access code email to user ${userId}: ${message}${upstreamStatus ? ` (HTTP ${upstreamStatus})` : ''}`,
    });
  }
}
