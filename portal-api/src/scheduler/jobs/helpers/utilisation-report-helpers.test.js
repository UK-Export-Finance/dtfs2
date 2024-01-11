const { produce } = require('immer');
const {
  getReportDueDate,
  getFormattedReportDueDate,
  getReportOverdueChaserDate,
  getReportPeriod,
  getFormattedReportPeriod,
  getIsReportSubmitted,
  getEmailRecipient,
  sendEmailToAllBanksWhereReportNotReceived,
} = require('./utilisation-report-helpers');
const externalApi = require('../../../external-api/api');
const api = require('../../../v1/api');
const MOCK_BANKS = require('../../../../test-helpers/mock-banks');
const MOCK_UTILISATION_REPORT = require('../../../../test-helpers/mock-utilisation-reports');

jest.mock('../../../external-api/api');
jest.mock('../../../v1/api');

console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

const originalProcessEnv = process.env;

describe('utilisation-report-helpers', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getReportDueDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-07'),
      },
      {
        today: new Date('2023-11-09'),
        businessDay: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-09'),
      },
    ])(
      'returns business day $businessDay as due date $expectedDueDate based on bank holidays $bankHolidays',
      async ({ today, businessDay, bankHolidays, expectedDueDate }) => {
        // Arrange
        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDay;
        externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue(bankHolidays);

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
        businessDay: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '7 November 2023',
      },
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '9 November 2023',
      },
    ])(
      'returns business day $businessDay as formatted due date $expectedDueDate based on bank holidays $bankHolidays',
      async ({ today, businessDay, bankHolidays, expectedDueDate }) => {
        // Arrange
        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDay;
        externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getFormattedReportDueDate();

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getReportOverdueChaserDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-07'),
      },
      {
        today: new Date('2023-11-10'),
        businessDay: 5,
        bankHolidays: [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-09'),
      },
    ])(
      'returns business day $businessDay as due date $expectedDueDate based on bank holidays $bankHolidays',
      async ({ today, businessDay, bankHolidays, expectedDueDate }) => {
        // Arrange
        jest.useFakeTimers().setSystemTime(today);
        process.env.UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = businessDay;
        externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getReportOverdueChaserDate();

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
      const result = getReportPeriod();

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

      // Assert
      expect(reportPeriod).toEqual(expectedReportPeriod);
    });
  });

  describe('getIsReportSubmitted', () => {
    it('returns false when there are no existing reports', async () => {
      // Arrange
      const today = new Date('2023-11-15');
      jest.useFakeTimers().setSystemTime(today);

      api.getUtilisationReports.mockResolvedValue([]);

      // Act
      const result = await getIsReportSubmitted(MOCK_BANKS.HSBC);

      // Assert
      expect(result).toBe(false);
    });

    it('returns true when there are existing reports', async () => {
      // Arrange
      const today = new Date('2023-11-15'); // so report period is October
      jest.useFakeTimers().setSystemTime(today);

      const existingReport = {
        ...MOCK_UTILISATION_REPORT,
        month: 10,
        year: 2023,
      };
      api.getUtilisationReports.mockResolvedValue([existingReport]);

      // Act
      const result = await getIsReportSubmitted(MOCK_BANKS.HSBC);

      // Assert
      expect(result).toBe(true);
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

  describe('sendEmailToAllBanksWhereReportNotReceived', () => {
    const setReportDueToday = () => {
      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
      const dueDate = new Date('2023-11-15');
      jest.useFakeTimers().setSystemTime(dueDate);
      return dueDate;
    };

    it('does not send an email when the bank has already submitted their report', async () => {
      // Arrange
      const dueDate = setReportDueToday();

      externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

      api.getAllBanks.mockResolvedValue([MOCK_BANKS.HSBC]);

      const existingReport = {
        ...MOCK_UTILISATION_REPORT,
        // 'month' should be 1-indexed, Date.getMonth() is 0-indexed, so this sets 'month' to the previous month
        month: dueDate.getMonth(),
        year: dueDate.getFullYear(),
      };
      api.getUtilisationReports.mockResolvedValue([existingReport]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('report has already been submitted'));
    });

    it('does not send an email when the bank has no payment officer team email', async () => {
      // Arrange
      setReportDueToday();

      externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

      const bankWithoutPaymentOfficerTeam = produce(MOCK_BANKS.HSBC, (draftBank) => {
        delete draftBank.paymentOfficerTeam.email;
      });
      api.getAllBanks.mockResolvedValue([bankWithoutPaymentOfficerTeam]);

      api.getUtilisationReports.mockResolvedValue([]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('no payment officer team email set'));
    });

    it('does not send an email when the bank has and invalid payment officer team email', async () => {
      // Arrange
      setReportDueToday();

      externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

      const invalidEmail = 'invalid-email';
      const bankWithoutPaymentOfficerTeam = produce(MOCK_BANKS.HSBC, (draftBank) => {
        draftBank.paymentOfficerTeam.email = invalidEmail;
      });
      api.getAllBanks.mockResolvedValue([bankWithoutPaymentOfficerTeam]);

      api.getUtilisationReports.mockResolvedValue([]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`invalid payment officer team email '${invalidEmail}'`));
    });

    it('sends emails using the default team name when bank does not have one set', async () => {
      // Arrange
      setReportDueToday();

      externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

      const validBarclaysEmail = 'valid-barclays-email@example.com';
      const validBarclaysBank = produce(MOCK_BANKS.BARCLAYS, (draftBank) => {
        delete draftBank.paymentOfficerTeam.teamName;
        draftBank.paymentOfficerTeam.email = validBarclaysEmail;
      });
      api.getAllBanks.mockResolvedValue([validBarclaysBank]);

      api.getUtilisationReports.mockResolvedValue([]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('missing a payment officer team name'));

      expect(sendEmailCallback).toHaveBeenCalledTimes(1);
      expect(sendEmailCallback).toHaveBeenCalledWith({
        emailAddress: validBarclaysEmail,
        recipient: 'Team',
      });
    });

    it('sends emails to all banks', async () => {
      // Arrange
      setReportDueToday();

      externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

      const validBarclaysEmail = 'valid-barclays-email@example.com';
      const validBarclaysTeamName = 'Barclays Payment Officer Team';
      const validBarclaysBank = produce(MOCK_BANKS.BARCLAYS, (draftBank) => {
        draftBank.paymentOfficerTeam.email = validBarclaysEmail;
        draftBank.paymentOfficerTeam.teamName = validBarclaysTeamName;
      });

      const validHsbcEmail = 'valid-hsbc-email@example.com';
      const validHsbcTeamName = 'HSBC Payment Officer Team';
      const validHsbcBank = produce(MOCK_BANKS.HSBC, (draftBank) => {
        draftBank.paymentOfficerTeam.email = validHsbcEmail;
        draftBank.paymentOfficerTeam.teamName = validHsbcTeamName;
      });

      api.getAllBanks.mockResolvedValue([validBarclaysBank, validHsbcBank]);

      api.getUtilisationReports.mockResolvedValue([]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).toHaveBeenCalledTimes(2);
      expect(sendEmailCallback).toHaveBeenCalledWith({
        emailAddress: validBarclaysEmail,
        recipient: validBarclaysTeamName,
      });
      expect(sendEmailCallback).toHaveBeenCalledWith({
        emailAddress: validHsbcEmail,
        recipient: validHsbcTeamName,
      });
    });
  });
});
