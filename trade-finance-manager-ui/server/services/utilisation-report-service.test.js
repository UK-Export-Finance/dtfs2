jest.mock('../api');

const { getFormattedReportDueDate, getFormattedReportPeriod } = require('./utilisation-report-service');
const api = require('../api');

const originalProcessEnv = process.env;

describe('utilisation-report-service', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getFormattedReportDueDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: { 'england-and-wales': { events: [] } },
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '7 November 2023',
      },
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: {
          'england-and-wales': {
            events: [
              { date: '2023-11-03' }, // Friday
              { date: '2023-11-06' }, // Monday
            ],
          },
        },
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '9 November 2023',
      },
    ])(
      'returns business day $businessDay as formatted due date $expectedDueDate based on bank holidays $bankHolidays',
      async ({ today, businessDay, bankHolidays, expectedDueDate }) => {
        // Arrange
        const userToken = 'user-token';

        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDay;

        api.getUkBankHolidays.mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getFormattedReportDueDate(userToken);

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getFormattedReportPeriod', () => {
    it.each([
      { today: new Date('2023-11-15'), expectedReportPeriod: 'October 2023' },
      { today: new Date('2023-03-31'), expectedReportPeriod: 'February 2023' },
      { today: new Date('2023-01-15'), expectedReportPeriod: 'December 2022' },
    ])("returns '$expectedReportPeriod' when today is $today", ({ today, expectedReportPeriod }) => {
      // Arrange
      jest.useFakeTimers().setSystemTime(today);

      // Act
      const reportPeriod = getFormattedReportPeriod();

      // Assert
      expect(reportPeriod).toEqual(expectedReportPeriod);
    });
  });
});
