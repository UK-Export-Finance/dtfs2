import { produce } from 'immer';
import { sendReportSubmissionPeriodStartEmailsJob } from './index';
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

describe('sendReportSubmissionPeriodStartEmailsJob', () => {
  afterEach(() => {
    process.env = originalProcessEnv;
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('sends emails to all banks when valid payment officer team emails are set', async () => {
    // Arrange
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

    jest.useFakeTimers().setSystemTime(new Date('2023-11-01'));

    const validTestbank1Email = 'valid-testbank1-email@example.com';
    const validtestBank1 = produce(aBank(), (draftBank) => {
      draftBank.paymentOfficerTeam.emails = [validTestbank1Email];
    });

    const validTestbank2Email1 = 'valid-testbank2-email@example.com';
    const quarterlyReportingSchedule = [
      { startMonth: 11, endMonth: 1 },
      { startMonth: 2, endMonth: 4 },
      { startMonth: 5, endMonth: 7 },
      { startMonth: 8, endMonth: 10 },
    ];
    const validtestBank2 = produce(aBank(), (draftBank) => {
      draftBank.paymentOfficerTeam.emails = [validTestbank2Email1];
      draftBank.utilisationReportPeriodSchedule = quarterlyReportingSchedule;
    });

    jest.mocked(api.getAllBanks).mockResolvedValue([validtestBank1, validtestBank2]);
    jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);
    jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue([]);

    // Act
    await sendReportSubmissionPeriodStartEmailsJob.task('manual');

    // Assert
    const expectedEmailTemplate = EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_SUBMISSION_PERIOD_START;
    const expectedMonthlyReportPeriod = 'October 2023';
    const expectedQuarterlyReportPeriod = 'August to October 2023';
    const expectedReportDueDate = '14 November 2023';

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validTestbank1Email, {
      recipient: validtestBank1.paymentOfficerTeam.teamName,
      reportPeriod: expectedMonthlyReportPeriod,
      reportDueDate: expectedReportDueDate,
    });
    expect(sendEmail).toHaveBeenCalledWith(expectedEmailTemplate, validTestbank2Email1, {
      recipient: validtestBank2.paymentOfficerTeam.teamName,
      reportPeriod: expectedQuarterlyReportPeriod,
      reportDueDate: expectedReportDueDate,
    });
  });
});
