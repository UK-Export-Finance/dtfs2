import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidParameterError extends ApiError {
  constructor(parameterName: string, parameterValue: unknown) {
    super({
      status: HttpStatusCode.BadRequest,
      message: `Invalid ${parameterName}: ${JSON.stringify(parameterValue)}`,
    });

    this.name = this.constructor.name;
  }
}
