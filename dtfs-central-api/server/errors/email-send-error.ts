export class EmailSendError extends Error {
  constructor(userId: string, message: string, status?: number) {
    super(`Failed to send access code email to user ${userId}: ${message}${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'EmailSendError';
  }
}
