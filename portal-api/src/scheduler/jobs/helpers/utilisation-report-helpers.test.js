const {
  getReportDueDate,
  getFormattedReportDueDate,
  getReportPeriodMonthAndYear,
  getFormattedReportPeriod,
  getEmailRecipient,
} = require('./utilisation-report-helpers');
const externalApi = require('../../../external-api/bank-holidays');

jest.mock('../../../external-api/bank-holidays');

console.warn = jest.fn();

const originalProcessEnv = process.env;

describe('utilisation-report-helpers', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.useRealTimers();
  });

  describe('getReportDueDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDaysToAdd: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-08'),
      },
      {
        today: new Date('2023-11-10'),
        businessDaysToAdd: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-10'),
      },
    ])(
      'returns due date $expectedDueDate based on $businessDaysToAdd business days from start of month and bank holidays $bankHolidays',
      async ({ today, businessDaysToAdd, bankHolidays, expectedDueDate }) => {
        // Arrange
        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDaysToAdd;
        externalApi.getBankHolidayDatesForRegion.mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getReportDueDate();

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getFormattedReportDueDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDaysToAdd: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '8 November 2023',
      },
      {
        today: new Date('2023-11-10'),
        businessDaysToAdd: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '10 November 2023',
      },
    ])(
      'returns formatted due date $expectedDueDate based on $businessDaysToAdd business days from start of month and bank holidays $bankHolidays',
      async ({ today, businessDaysToAdd, bankHolidays, expectedDueDate }) => {
        // Arrange
        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDaysToAdd;
        externalApi.getBankHolidayDatesForRegion.mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getFormattedReportDueDate();

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getReportPeriodMonthAndYear', () => {
    it.each([
      { today: new Date('2023-11-15'), expectedMonth: 10, expectedYear: 2023 },
      { today: new Date('2023-03-31'), expectedMonth: 2, expectedYear: 2023 },
      { today: new Date('2023-01-15'), expectedMonth: 12, expectedYear: 2022 },
    ])('returns { month: $expectedMonth, year: $expectedYear } when today is $today', ({ today, expectedMonth, expectedYear }) => {
      // Arrange
      jest.useFakeTimers().setSystemTime(today);

      // Act
      const result = getReportPeriodMonthAndYear();

      expect(result.month).toEqual(expectedMonth);
      expect(result.year).toEqual(expectedYear);
    });
  });

  describe('getFormattedReportPeriod', () => {
    it.each([
      { today: new Date('2023-11-15'), expectedReportPeriod: 'October 2023' },
      { today: new Date('2023-03-31'), expectedReportPeriod: 'February 2023' },
      { today: new Date('2023-01-15'), expectedReportPeriod: 'December 2022' },
    ])(`returns '$expectedReportPeriod' when today is $today`, ({ today, expectedReportPeriod }) => {
      // Arrange
      jest.useFakeTimers().setSystemTime(today);

      // Act
      const reportPeriod = getFormattedReportPeriod();

      expect(reportPeriod).toEqual(expectedReportPeriod);
    });
  });

  describe('getEmailRecipient', () => {
    it('returns the payment officer team name when present', () => {
      // Arrange
      const paymentOfficerTeam = {
        teamName: 'A Real Payment Officer Team',
        email: 'email@example.com',
      };
      const bankName = 'Some Bank Name';

      // Act
      const result = getEmailRecipient(paymentOfficerTeam, bankName);

      // Assert
      expect(result).toEqual(paymentOfficerTeam.teamName);
    });

    it.each([{ paymentOfficerTeam: undefined }, { paymentOfficerTeam: { email: 'email@example.com' } }])(
      'returns the default team name when when paymentOfficerTeam is $paymentOfficerTeam',
      ({ paymentOfficerTeam }) => {
        // Arrange
        const bankName = 'Some Bank Name';

        // Act
        const result = getEmailRecipient(paymentOfficerTeam, bankName);

        // Assert
        expect(result).toEqual('Team');
      },
    );
  });
});
