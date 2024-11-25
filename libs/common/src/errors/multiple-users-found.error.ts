import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class MultipleUsersFoundError extends ApiError {
  constructor({ userIdsFound }: { userIdsFound: string[] }) {
    super({
      status: HttpStatusCode.InternalServerError,
      message: `Multiple users found (${userIdsFound.join(', ')})`,
    });

    this.name = this.constructor.name;
  }
}
