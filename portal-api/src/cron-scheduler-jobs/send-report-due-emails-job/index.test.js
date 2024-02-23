const { subDays } = require('date-fns');
const { produce } = require('immer');
const { sendReportDueEmailsJob } = require('./index');
const api = require('../../v1/api');
const externalApi = require('../../external-api/api');
const sendEmail = require('../../external-api/send-email');
const MOCK_BANKS = require('../../../test-helpers/mock-banks');
const { EMAIL_TEMPLATE_IDS } = require('../../constants');

jest.mock('../../v1/api');
jest.mock('../../external-api/bank-holidays');
jest.mock('../../external-api/send-email', () => jest.fn());

console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

const originalProcessEnv = process.env;

describe('sendReportDueEmailsJob', () => {
  const validBarclaysEmail = 'valid-barclays-email@example.com';
  const validBarclaysBank = produce(MOCK_BANKS.BARCLAYS, (draftBank) => {
    draftBank.paymentOfficerTeam.email = validBarclaysEmail;
  });
  const validHsbcEmail = 'valid-hsbc-email@example.com';
  const validHsbcBank = produce(MOCK_BANKS.HSBC, (draftBank) => {
    draftBank.paymentOfficerTeam.email = validHsbcEmail;
  });

  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('does not send emails when report is not due today', async () => {
    // Arrange
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
    const dueDate = new Date('2023-11-14');
    const today = subDays(dueDate, 1);
    jest.useFakeTimers().setSystemTime(today);

    externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

    api.getAllBanks.mockResolvedValue([validBarclaysBank, validHsbcBank]);

    // Act
    await sendReportDueEmailsJob.task();

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('report is not due today'));
  });

  it('sends emails to all banks when valid payment officer team emails are set and report not yet submitted', async () => {
    // Arrange
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
    const dueDate = new Date('2023-11-14');
    jest.useFakeTimers().setSystemTime(dueDate);

    externalApi.bankHolidays.getBankHolidayDatesForRegion.mockResolvedValue([]);

    api.getAllBanks.mockResolvedValue([validBarclaysBank, validHsbcBank]);

    api.getUtilisationReports.mockResolvedValue([]);

    // Act
    await sendReportDueEmailsJob.task();

    // Assert
    const expectedEmailTemplate = EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY;
    const expectedReportPeriod = 'October 2023';

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validBarclaysEmail, {
      recipient: validBarclaysBank.paymentOfficerTeam.teamName,
      reportPeriod: expectedReportPeriod,
    });
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validHsbcEmail, {
      recipient: validHsbcBank.paymentOfficerTeam.teamName,
      reportPeriod: expectedReportPeriod,
    });
  });
});
