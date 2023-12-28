import { InvalidReportStatusRequestError } from './invalid-report-status-request.error';

describe('InvalidReportStatusRequestError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    // Act
    const exception = new InvalidReportStatusRequestError(message);

    // Assert
    expect(exception.message).toBe(message);
  });

  // Test will pass if we ever manage to update to es6
  // it('exposes the name of the exception', () => {
  //   // Act
  //   const exception = new InvalidReportStatusRequestError(message);

  //   // Assert
  //   expect(exception.name).toBe('InvalidEnvironmentVariableError');
  // });
});