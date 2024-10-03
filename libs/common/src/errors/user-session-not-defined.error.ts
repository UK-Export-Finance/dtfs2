import { HttpStatusCode } from 'axios';
import { UserSessionError } from './user-session.error';

export class UserSessionNotDefinedError extends UserSessionError {
  constructor() {
    super({
      status: HttpStatusCode.Unauthorized,
      message: 'Expected session.user to be defined',
    });

    this.name = this.constructor.name;
  }
}
