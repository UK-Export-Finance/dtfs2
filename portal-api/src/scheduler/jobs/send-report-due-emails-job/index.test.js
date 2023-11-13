const { subDays } = require('date-fns');
const { produce } = require('immer');
const sendReportDueEmailsJob = require('.');
const api = require('../../../v1/api');
const externalApi = require('../../../external-api/bank-holidays');
const sendEmail = require('../../../external-api/send-email');
const MOCK_BANKS = require('../../../../test-helpers/mock-banks');
const MOCK_UTILISATION_REPORT = require('../../../../test-helpers/mock-utilisation-reports');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');

jest.mock('../../../v1/api');
jest.mock('../../../external-api/bank-holidays');
jest.mock('../../../external-api/send-email', () => jest.fn());

console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

const sendReportDueEmailsJobTask = sendReportDueEmailsJob.init().task;

const NOV_2023_REPORT_DUE_DATE = new Date('2023-11-15');

describe('sendReportDueEmailsJob', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('does not send emails when report is not due today', async () => {
    // Arrange
    const today = subDays(NOV_2023_REPORT_DUE_DATE, 1);
    jest.useFakeTimers().setSystemTime(today);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    // Act
    await sendReportDueEmailsJobTask();

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('report is not due today'));
  });

  it('does not send an email when the bank has already submitted their report', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(NOV_2023_REPORT_DUE_DATE);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    api.getAllBanks.mockResolvedValue([MOCK_BANKS.HSBC]);

    const existingReport = {
      ...MOCK_UTILISATION_REPORT,
      // 'month' should be 1-indexed, Date.getMonth() is 0-indexed, so this sets 'month' to the previous month
      month: NOV_2023_REPORT_DUE_DATE.getMonth(),
      year: NOV_2023_REPORT_DUE_DATE.getFullYear(),
    };
    api.getUtilisationReports.mockResolvedValue({ status: 200, data: [existingReport] });

    // Act
    await sendReportDueEmailsJobTask();

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('report has already been submitted'));
  });

  it('does not send an email when the bank has no payment officer team email', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(NOV_2023_REPORT_DUE_DATE);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    const bankWithoutPaymentOfficerTeam = produce(MOCK_BANKS.HSBC, (draftBank) => {
      delete draftBank.paymentOfficerTeam.email;
    });
    api.getAllBanks.mockResolvedValue([bankWithoutPaymentOfficerTeam]);

    api.getUtilisationReports.mockResolvedValue({ status: 200, data: [] });

    // Act
    await sendReportDueEmailsJobTask();

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('no payment officer team email set'));
  });

  it('does not send an email when the bank has and invalid payment officer team email', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(NOV_2023_REPORT_DUE_DATE);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    const invalidEmail = 'invalid-email';
    const bankWithoutPaymentOfficerTeam = produce(MOCK_BANKS.HSBC, (draftBank) => {
      draftBank.paymentOfficerTeam.email = invalidEmail;
    });
    api.getAllBanks.mockResolvedValue([bankWithoutPaymentOfficerTeam]);

    api.getUtilisationReports.mockResolvedValue({ status: 200, data: [] });

    // Act
    await sendReportDueEmailsJobTask();

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`invalid payment officer team email '${invalidEmail}'`));
  });

  it('sends emails using the default team name when bank does not have one set', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(NOV_2023_REPORT_DUE_DATE);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    const validBarclaysEmail = 'valid-barclays-email@example.com';
    const validBarclaysBank = produce(MOCK_BANKS.BARCLAYS, (draftBank) => {
      delete draftBank.paymentOfficerTeam.teamName;
      draftBank.paymentOfficerTeam.email = validBarclaysEmail;
    });
    api.getAllBanks.mockResolvedValue([validBarclaysBank]);

    api.getUtilisationReports.mockResolvedValue({ status: 200, data: [] });

    // Act
    await sendReportDueEmailsJobTask();

    // Assert
    const expectedEmailTemplate = EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY;

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('missing a payment officer team name'));

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expectedEmailTemplate,
      validBarclaysEmail,
      expect.objectContaining({
        recipient: 'Team',
      }),
    );
  });

  it('sends emails to all banks when valid payment officer team emails are set and report not yet submitted', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(NOV_2023_REPORT_DUE_DATE);

    externalApi.getBankHolidayDatesForRegion.mockResolvedValue([]);

    const validBarclaysEmail = 'valid-barclays-email@example.com';
    const validBarclaysBank = produce(MOCK_BANKS.BARCLAYS, (draftBank) => {
      draftBank.paymentOfficerTeam.email = validBarclaysEmail;
    });
    const validHsbcEmail = 'valid-hsbc-email@example.com';
    const validHsbcBank = produce(MOCK_BANKS.HSBC, (draftBank) => {
      draftBank.paymentOfficerTeam.email = validHsbcEmail;
    });
    api.getAllBanks.mockResolvedValue([validBarclaysBank, validHsbcBank]);

    api.getUtilisationReports.mockResolvedValue({ status: 200, data: [] });

    // Act
    await sendReportDueEmailsJobTask();

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
