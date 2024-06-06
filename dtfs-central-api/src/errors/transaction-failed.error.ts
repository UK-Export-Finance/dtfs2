import { HttpStatusCode } from 'axios';
import { ApiError } from '.';

export class TransactionFailedError extends ApiError {
  constructor(apiError?: ApiError) {
    super({
      message: apiError?.message ?? 'Transaction failed',
      status: apiError?.status ?? HttpStatusCode.InternalServerError,
    });
  }
}
