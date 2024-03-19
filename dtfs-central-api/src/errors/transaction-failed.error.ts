import { HttpStatusCode } from 'axios';
import { ApiError } from '.';

export class TransactionFailedError extends ApiError {
  constructor(message: string = 'Transaction failed') {
    super({
      message,
      status: HttpStatusCode.InternalServerError,
    });
  }
}
