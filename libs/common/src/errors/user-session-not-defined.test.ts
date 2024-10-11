import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { UserSessionNotDefinedError } from './user-session-not-defined.error';
import { UserSessionError } from './user-session.error';

describe('UserSessionNotDefinedError', () => {
  it('exposes the message the error was created with', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception.message).toEqual('Expected session.user to be defined');
  });

  it('exposes the 401 (Unauthorised) status code', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.Unauthorized);
  });

  it('exposes the INVALID_USER_SESSION code', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception.code).toEqual('INVALID_USER_SESSION');
  });

  it('is an instance of UserSessionNotDefinedError', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserSessionNotDefinedError);
  });

  it('is an instance of UserSessionError', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserSessionError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new UserSessionNotDefinedError();

    // Assert
    expect(exception.name).toEqual('UserSessionNotDefinedError');
  });
});
