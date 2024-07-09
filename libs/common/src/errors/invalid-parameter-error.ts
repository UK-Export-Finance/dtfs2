import { ApiError } from './api.error';

export class InvalidParameterError extends ApiError {
  constructor(parameterName: string, parameterValue: unknown) {
    super({
      status: 400,
      message: `Invalid ${parameterName}: ${JSON.stringify(parameterValue)}`,
    });

    this.name = this.constructor.name;
  }
}
