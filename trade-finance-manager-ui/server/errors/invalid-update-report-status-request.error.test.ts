import { InvalidUpdateReportStatusRequestError } from './invalid-update-report-status-request.error';

describe('InvalidUpdateReportStatusRequestError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    // Act
    const exception = new InvalidUpdateReportStatusRequestError(message);

    // Assert
    expect(exception.message).toBe(message);
  });

  // Test will pass if we ever update to es6
  // it('exposes the name of the exception', () => {
  //   // Act
  //   const exception = new InvalidReportStatusRequestError(message);

  //   // Assert
  //   expect(exception.name).toBe('InvalidEnvironmentVariableError');
  // });
});