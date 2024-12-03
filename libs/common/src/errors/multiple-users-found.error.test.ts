import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { MultipleUsersFoundError } from './multiple-users-found.error';

describe('MultipleUsersFoundError', () => {
  const userIdsFound = ['1', '2'];

  it('exposes the user ids found the error was created with', () => {
    // Act
    const exception = new MultipleUsersFoundError({ userIdsFound });

    // Assert
    expect(exception.message).toEqual(`Multiple users found (1, 2)`);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Act
    const exception = new MultipleUsersFoundError({ userIdsFound });

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.InternalServerError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new MultipleUsersFoundError({ userIdsFound });

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new MultipleUsersFoundError({ userIdsFound });

    // Assert
    expect(exception.name).toEqual('MultipleUsersFoundError');
  });
});
