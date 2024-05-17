import { InvalidReportStatusError } from './invalid-report-status.error';

describe('InvalidReportStatusError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new InvalidReportStatusError(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidReportStatusError(message);

    expect(exception.name).toBe('InvalidReportStatusError');
  });
});
