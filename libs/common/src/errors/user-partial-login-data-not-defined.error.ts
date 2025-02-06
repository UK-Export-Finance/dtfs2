import { HttpStatusCode } from 'axios';
import { UserSessionError } from './user-session.error';

/**
 * Error to use when a partially logged in user's session does not contain the expected data
 */
export class UserPartialLoginDataNotDefinedError extends UserSessionError {
  constructor() {
    super({
      status: HttpStatusCode.Unauthorized,
      message: 'Expected session.loginData to be defined',
    });

    this.name = this.constructor.name;
  }
}
