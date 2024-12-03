import { HttpStatusCode } from 'axios';
import { InvalidEnvironmentVariableError } from './invalid-environment-variable.error';

describe('InvalidEnvironmentVariableError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new InvalidEnvironmentVariableError(message);

    expect(exception.message).toEqual(message);
  });

  it('exposes the 500 (Internal Server Error) status code', () => {
    // Act
    const error = new InvalidEnvironmentVariableError(message);

    // Assert
    expect(error.status).toEqual(HttpStatusCode.InternalServerError);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidEnvironmentVariableError(message);

    expect(exception.name).toEqual('InvalidEnvironmentVariableError');
  });
});
