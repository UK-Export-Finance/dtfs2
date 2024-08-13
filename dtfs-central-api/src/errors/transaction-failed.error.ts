import { HttpStatusCode } from 'axios';
import { ApiError } from '.';

export class TransactionFailedError extends ApiError {
  constructor(apiError?: ApiError) {
    const errorMessage = apiError?.message ?? 'Unknown error';
    const errorStatus = apiError?.status ?? HttpStatusCode.InternalServerError;
    super({
      message: errorMessage,
      status: errorStatus,
    });
  }
}
