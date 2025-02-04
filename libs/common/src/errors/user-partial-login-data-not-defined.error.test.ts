import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { UserSessionError } from './user-session.error';
import { UserPartialLoginDataNotDefinedError } from './user-partial-login-data-not-defined.error';

describe('UserPartialLoginDataNotDefinedError', () => {
  it('should expose the message the error was created with', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception.message).toEqual('Expected session.loginData to be defined');
  });

  it('should expose the 401 (Unauthorised) status code', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.Unauthorized);
  });

  it('should expose the INVALID_USER_SESSION code', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception.code).toEqual('INVALID_USER_SESSION');
  });

  it('should be an instance of UserPartialLoginDataNotDefinedError', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserPartialLoginDataNotDefinedError);
  });

  it('should be an instance of UserSessionError', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(UserSessionError);
  });

  it('should be an instance of ApiError', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('should expose the name of the exception', () => {
    // Act
    const exception = new UserPartialLoginDataNotDefinedError();

    // Assert
    expect(exception.name).toEqual('UserPartialLoginDataNotDefinedError');
  });
});
