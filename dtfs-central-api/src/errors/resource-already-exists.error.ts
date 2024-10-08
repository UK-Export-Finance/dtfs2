import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';

export class ResourceAlreadyExistsError extends ApiError {
  constructor(message: string) {
    super({
      message,
      status: HttpStatusCode.Conflict,
    });
  }
}
