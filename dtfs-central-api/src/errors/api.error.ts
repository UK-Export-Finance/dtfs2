type ApiErrorParams = {
  status: number;
  message: string;
  cause?: unknown;
};

export abstract class ApiError extends Error {
  public status: number;

  protected constructor({ status, message, cause }: ApiErrorParams) {
    super(message);
    this.status = status;
    this.cause = cause;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
