/* eslint-disable no-param-reassign */
import { subDays } from 'date-fns';
import { produce } from 'immer';
import { sendReportDueEmailsJob } from '.';
import api from '../../v1/api';
import externalApi from '../../external-api/api';
import sendEmail from '../../external-api/send-email';
import { aBank } from '../../../test-helpers/test-data/banks';
import { EMAIL_TEMPLATE_IDS } from '../../constants';
import { aNotReceivedUtilisationReportResponse } from '../../../test-helpers/test-data/utilisation-report';

jest.mock('../../v1/api');
jest.mock('../../external-api/bank-holidays');
jest.mock('../../external-api/send-email', () => jest.fn());

console.error = jest.fn();
console.info = jest.fn();

const originalProcessEnv = { ...process.env };

describe('sendReportDueEmailsJob', () => {
  const validBarclaysEmail = 'valid-barclays-email@example.com';
  const validBarclaysBank = produce(aBank(), (draftBank) => {
    draftBank.paymentOfficerTeam.emails = [validBarclaysEmail];
  });
  const validHsbcEmail = 'valid-hsbc-email@example.com';
  const quarterlyReportingSchedule = [
    { startMonth: 11, endMonth: 1 },
    { startMonth: 2, endMonth: 4 },
    { startMonth: 5, endMonth: 7 },
    { startMonth: 8, endMonth: 10 },
  ];
  const validHsbcBank = produce(aBank(), (draftBank) => {
    draftBank.paymentOfficerTeam.emails = [validHsbcEmail];
    draftBank.utilisationReportPeriodSchedule = quarterlyReportingSchedule;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('does not send emails when report is not due today', async () => {
    // Arrange
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';
    const dueDate = new Date('2023-11-14');
    const today = subDays(dueDate, 1);
    jest.useFakeTimers().setSystemTime(today);

    jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue([]);
    jest.mocked(api.getAllBanks).mockResolvedValue([validBarclaysBank, validHsbcBank]);

    // Act
    await sendReportDueEmailsJob.task('manual');

    // Assert
    expect(sendEmail).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('report is not due today'));
  });

  it('sends emails to all banks when valid payment officer team emails are set and report not yet submitted', async () => {
    // Arrange
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';
    const dueDate = new Date('2023-11-14');
    jest.useFakeTimers().setSystemTime(dueDate);

    jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);
    jest.mocked(api.getAllBanks).mockResolvedValue([validBarclaysBank, validHsbcBank]);
    jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

    // Act
    await sendReportDueEmailsJob.task('manual');

    // Assert
    const expectedEmailTemplate = EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY;
    const expectedMonthlyReportPeriod = 'October 2023';
    const expectedQuarterlyReportPeriod = 'August to October 2023';

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validBarclaysEmail, {
      recipient: validBarclaysBank.paymentOfficerTeam.teamName,
      reportPeriod: expectedMonthlyReportPeriod,
    });
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validHsbcEmail, {
      recipient: validHsbcBank.paymentOfficerTeam.teamName,
      reportPeriod: expectedQuarterlyReportPeriod,
    });
  });
});
