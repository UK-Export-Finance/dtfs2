import { HttpStatusCode } from 'axios';
import { UserSessionError } from './user-session.error';

export class UserTokenNotDefinedError extends UserSessionError {
  constructor() {
    super({
      status: HttpStatusCode.Unauthorized,
      message: 'Expected session.userToken to be defined',
    });

    this.name = this.constructor.name;
  }
}
