import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class EmailSendError extends ApiError {
  constructor(userId: string, message: string, upstreamStatus?: number, emailType: string = 'access code email') {
    super({
      status: HttpStatusCode.InternalServerError,
      message: `Failed to send ${emailType} to user ${userId}: ${message}${upstreamStatus ? ` (HTTP ${upstreamStatus})` : ''}`,
    });
  }
}
