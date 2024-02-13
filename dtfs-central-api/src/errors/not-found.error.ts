export class NotFoundError extends Error {
  constructor(options?: { message?: string; cause?: unknown }) {
    super(options?.message ?? 'Not found', { cause: options?.cause });
    this.name = this.constructor.name;
  }
}
