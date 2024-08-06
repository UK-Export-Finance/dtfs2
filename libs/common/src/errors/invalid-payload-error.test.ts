import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { InvalidPayloadError } from './invalid-payload-error';

describe('InvalidPayloadError', () => {
  const message = 'Example message';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.status).toBe(HttpStatusCode.BadRequest);
  });

  it('is an instance of InvalidFacilityIdError', () => {
    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception).toBeInstanceOf(InvalidPayloadError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.name).toEqual('InvalidPayloadError');
  });
});
