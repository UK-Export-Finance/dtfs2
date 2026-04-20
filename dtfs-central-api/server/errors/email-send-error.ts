import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class EmailSendError extends ApiError {
  /**
   * Error thrown when an email fails to send.
   *
   * @param userId - The id of the user to whom the email was being sent.
   * @param message - A description of the failure or upstream error message.
   * @param upstreamStatus - Optional HTTP status code returned by the upstream email provider.
   * @param emailType - Optional email type (defaults to 'access code email').
   */
  constructor(userId: string, message: string, upstreamStatus?: number, emailType: string = 'access code email') {
    super({
      status: HttpStatusCode.InternalServerError,
      message: `Failed to send ${emailType} to user ${userId}: ${message}${upstreamStatus ? ` (HTTP ${upstreamStatus})` : ''}`,
    });
  }
}
