export class MissingUserFieldsError extends Error {
  constructor(userId: string) {
    super(`Missing required user fields for user ${userId}`);
    this.name = 'MissingUserFieldsError';
  }
}
