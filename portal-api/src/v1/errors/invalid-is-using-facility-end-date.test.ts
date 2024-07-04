import { ApiError } from '@ukef/dtfs2-common';
import { InvalidIsUsingFacilityEndDate } from './invalid-is-using-facility-end-date.error';

describe('InvalidIsUsingFacilityEndDate', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new InvalidIsUsingFacilityEndDate(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Arrange
    const message = '';

    // Act
    const error = new InvalidIsUsingFacilityEndDate(message);

    // Assert
    expect(error.status).toBe(400);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidIsUsingFacilityEndDate(message);

    // Assert
    expect(exception.name).toEqual('InvalidIsUsingFacilityEndDate');
  });

  it('is an instance of an ApiError', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidIsUsingFacilityEndDate(message);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('is an instance of InvalidIsUsingFacilityEndDate', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidIsUsingFacilityEndDate(message);

    // Assert
    expect(exception).toBeInstanceOf(InvalidIsUsingFacilityEndDate);
  });
});
