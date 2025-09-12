import { isBefore } from 'date-fns';

describe('bank-holidays', () => {
  /**
   * If this test fails it means it is time to update the bank holiday backup data.
   * The backup should be retrieved from https://www.gov.uk/bank-holidays.json.
   *
   * After updating the backup, the deadline in the test should be extended
   * to be 6 months before the date of the final bank holiday in the backup.
   */
  it('should have up to date backup data for bank holidays', () => {
    const deadlineForUpdatingBackup = new Date('2026-07-01');

    const isTodayBeforeTheDeadline = isBefore(new Date(), deadlineForUpdatingBackup);

    expect(isTodayBeforeTheDeadline).toEqual(true);
  });
});
