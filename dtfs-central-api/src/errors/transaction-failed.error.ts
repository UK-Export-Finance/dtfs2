import { HttpStatusCode } from 'axios';
import { ApiError } from '.';

type CreateTransactionFailedErrorParams = {
  message: string;
  status: number;
};

export class TransactionFailedError extends ApiError {
  private constructor({ message, status }: CreateTransactionFailedErrorParams) {
    super({ message, status });
  }

  public static forApiError(apiError: ApiError): TransactionFailedError {
    return new TransactionFailedError({
      message: apiError.message,
      status: apiError.status,
    });
  }

  public static forError(error: Error): TransactionFailedError {
    return new TransactionFailedError({
      message: error.message,
      status: HttpStatusCode.InternalServerError,
    });
  }

  public static forUnknownError(): TransactionFailedError {
    return new TransactionFailedError({
      message: 'An unknown error occurred',
      status: HttpStatusCode.InternalServerError,
    });
  }
}
