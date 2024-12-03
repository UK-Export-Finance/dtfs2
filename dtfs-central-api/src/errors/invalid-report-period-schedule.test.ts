import { InvalidReportPeriodScheduleError } from './invalid-report-period-schedule';

describe('InvalidReportPeriodScheduleError', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new InvalidReportPeriodScheduleError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidReportPeriodScheduleError(message);

    // Assert
    expect(exception.name).toEqual('InvalidReportPeriodScheduleError');
  });
});
