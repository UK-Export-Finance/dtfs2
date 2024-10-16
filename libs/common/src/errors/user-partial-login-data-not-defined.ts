import { HttpStatusCode } from 'axios';
import { UserSessionError } from './user-session.error';

export class UserPartialLoginDataNotDefinedError extends UserSessionError {
  constructor() {
    super({
      status: HttpStatusCode.Unauthorized,
      message: 'Expected session.loginData to be defined',
    });

    this.name = this.constructor.name;
  }
}
