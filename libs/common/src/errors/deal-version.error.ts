import { ApiError } from './api.error';

export class DealVersionError extends ApiError {
  constructor(message: string) {
    super({
      status: 400,
      message,
    });

    this.name = this.constructor.name;
  }
}
