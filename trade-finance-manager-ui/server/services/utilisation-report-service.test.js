const { getReportDueDate, getReportPeriodStart } = require('./utilisation-report-service');

const originalProcessEnv = process.env;

describe('utilisation-report-service', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('getReportDueDate', () => {
    it.each([
      {
        businessDay: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-07'),
      },
      {
        businessDay: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-09'),
      },
    ])(
      'returns business day $businessDay as formatted due date $expectedDueDate based on bank holidays $bankHolidays',
      async ({ businessDay, bankHolidays, expectedDueDate }) => {
        // Arrange
        const submissionMonth = '2023-11';

        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = `${businessDay}`;

        // Act
        const dueDate = await getReportDueDate(bankHolidays, submissionMonth);

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getReportPeriodStart', () => {
    it.each([
      { submissionMonth: '2023-11', expectedReportPeriodStart: { month: 10, year: 2023 } },
      { submissionMonth: '2023-03', expectedReportPeriodStart: { month: 2, year: 2023 } },
      { submissionMonth: '2023-01', expectedReportPeriodStart: { month: 12, year: 2022 } },
    ])("returns '$expectedReportPeriodStart' when submissionMonth is '$submissionMonth'", ({ submissionMonth, expectedReportPeriodStart }) => {
      expect(getReportPeriodStart(submissionMonth)).toEqual(expectedReportPeriodStart);
    });
  });
});
