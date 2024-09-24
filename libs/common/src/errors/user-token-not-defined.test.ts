import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { UserTokenNotDefinedError } from './user-token-not-defined.error';
import { UserSessionError } from './user-session.error';

describe('UserTokenNotDefinedError', () => {
  it('exposes the message the error was created with', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception.message).toEqual('Expected session.userToken to be defined');
  });

  it('exposes the 401 (Unauthorised) status code', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception.status).toBe(HttpStatusCode.Unauthorized);
  });

  it('exposes the INVALID_USER_SESSION code', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception.code).toBe('INVALID_USER_SESSION');
  });

  it('is an instance of UserTokenNotDefinedError', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserTokenNotDefinedError);
  });

  it('is an instance of UserTokenError', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserSessionError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new UserTokenNotDefinedError();

    // Assert
    expect(exception.name).toEqual('UserTokenNotDefinedError');
  });
});
