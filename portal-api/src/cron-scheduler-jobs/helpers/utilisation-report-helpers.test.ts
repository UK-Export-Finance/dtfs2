import { BankReportPeriodSchedule, UtilisationReportStatus, UTILISATION_REPORT_STATUS, PENDING_RECONCILIATION } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import {
  getReportDueDate,
  getFormattedReportDueDate,
  getReportOverdueChaserDate,
  getIsReportDue,
  getEmailRecipient,
  sendEmailToAllBanksWhereReportNotReceived,
} from './utilisation-report-helpers';
import externalApi from '../../external-api/api';
import api from '../../v1/api';
import { aNotReceivedUtilisationReportResponse, aUtilisationReportResponse } from '../../../test-helpers/test-data/utilisation-report';
import { BankResponse, UtilisationReportResponseBody } from '../../v1/api-response-types';
import { aReportPeriod } from '../../../test-helpers/test-data/report-period';
import { aBank } from '../../../test-helpers/test-data/banks';
import { aMonthlyBankReportPeriodSchedule } from '../../../test-helpers/test-data/bank-report-period-schedule';

jest.mock('../../external-api/api');
jest.mock('../../v1/api');

console.error = jest.fn();
console.info = jest.fn();

const originalProcessEnv = { ...process.env };

describe('utilisation-report-helpers', () => {
  afterEach(() => {
    process.env = originalProcessEnv;
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getReportDueDate', () => {
    it.each([
      {
        today: new Date('2023-11-10'),
        businessDay: '5',
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-07'),
      },
      {
        today: new Date('2023-11-09'),
        businessDay: '5',
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
        jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue(bankHolidays);

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
        businessDay: '5',
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: '7 November 2023',
      },
      {
        today: new Date('2023-11-10'),
        businessDay: '5',
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
        jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue(bankHolidays);

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
        businessDay: '5',
        bankHolidays: [],
        // 2023-11-04 and 2023-11-05 are weekend dates.
        expectedDueDate: new Date('2023-11-07'),
      },
      {
        today: new Date('2023-11-10'),
        businessDay: '5',
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
        jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue(bankHolidays);

        // Act
        const dueDate = await getReportOverdueChaserDate();

        // Assert
        expect(dueDate).toEqual(expectedDueDate);
      },
    );
  });

  describe('getIsReportDue', () => {
    const BANK_ID = '123';

    it('throws an error when there are no reports for given period', async () => {
      // Arrange
      const reportPeriod = {
        start: {
          month: 1,
          year: 2098,
        },
        end: {
          month: 1,
          year: 2098,
        },
      };
      jest.mocked(api.getUtilisationReports).mockResolvedValue([]);

      // Act + Assert
      await expect(() => getIsReportDue(BANK_ID, reportPeriod)).rejects.toThrow(
        `Expected to find one report for bank (id: ${BANK_ID}) for report period January 2098 but found 0`,
      );
    });

    it('throws an error when there are no reports for given period', async () => {
      // Arrange
      const reportPeriod = {
        start: {
          month: 1,
          year: 2098,
        },
        end: {
          month: 1,
          year: 2098,
        },
      };
      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse(), aNotReceivedUtilisationReportResponse()]);

      // Act + Assert
      await expect(() => getIsReportDue(BANK_ID, reportPeriod)).rejects.toThrow(
        `Expected to find one report for bank (id: ${BANK_ID}) for report period January 2098 but found 2`,
      );
    });

    it('returns true when there is an existing report in the REPORT_NOT_RECEIVED state', async () => {
      // Arrange
      const reportPeriod = aReportPeriod();
      const existingReport = {
        ...aNotReceivedUtilisationReportResponse(),
        bankId: BANK_ID,
        reportPeriod,
      };
      jest.mocked(api.getUtilisationReports).mockResolvedValue([existingReport]);

      // Act
      const result = await getIsReportDue(BANK_ID, reportPeriod);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(BANK_ID, {
        reportPeriod,
      });
      expect(result).toEqual(true);
    });

    it.each(difference(Object.values(UTILISATION_REPORT_STATUS), [UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED]))(
      'returns false when there is an existing report with status %s',
      async (status: UtilisationReportStatus) => {
        // Arrange
        const reportPeriod = aReportPeriod();
        const existingReport = {
          ...aUtilisationReportResponse(),
          bankId: BANK_ID,
          status,
          reportPeriod,
        };
        jest.mocked(api.getUtilisationReports).mockResolvedValue([existingReport]);

        // Act
        const result = await getIsReportDue(BANK_ID, aReportPeriod());

        // Assert
        expect(api.getUtilisationReports).toHaveBeenCalledWith(BANK_ID, {
          reportPeriod,
        });
        expect(result).toEqual(false);
      },
    );
  });

  describe('getEmailRecipient', () => {
    it('returns the payment officer team name when present', () => {
      // Arrange
      const paymentOfficerTeam = {
        teamName: 'A Real Payment Officer Team',
        emails: ['email@example.com'],
      };
      const bankName = 'Some Bank Name';

      // Act
      const result = getEmailRecipient(paymentOfficerTeam, bankName);

      // Assert
      expect(result).toEqual(paymentOfficerTeam.teamName);
    });

    it.each([{ paymentOfficerTeam: undefined }, { paymentOfficerTeam: { emails: ['email@example.com'] } }])(
      'returns the default team name when paymentOfficerTeam is $paymentOfficerTeam',
      ({ paymentOfficerTeam }) => {
        // Arrange
        const bankName = 'Some Bank Name';

        // Act
        // @ts-expect-error we are explicitly test the case where the payment officer team object is not in the expected format
        const result = getEmailRecipient(paymentOfficerTeam, bankName);

        // Assert
        expect(result).toEqual('Team');
      },
    );
  });

  describe('sendEmailToAllBanksWhereReportNotReceived', () => {
    const CURRENT_REPORT_PERIOD_MONTH = 10;
    const CURRENT_YEAR = 2023;
    const DUE_DATE = new Date(`${CURRENT_YEAR}-${CURRENT_REPORT_PERIOD_MONTH + 1}-15`);
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(DUE_DATE);
    });

    it('does not send an email when the bank has already submitted their report', async () => {
      // Arrange
      const existingReport: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        status: PENDING_RECONCILIATION,
        reportPeriod: {
          start: { month: CURRENT_REPORT_PERIOD_MONTH, year: CURRENT_YEAR },
          end: { month: CURRENT_REPORT_PERIOD_MONTH, year: CURRENT_YEAR },
        },
      };
      jest.mocked(externalApi.bankHolidays.getBankHolidayDatesForRegion).mockResolvedValue([]);
      jest.mocked(api.getAllBanks).mockResolvedValue([
        {
          ...aBank(),
          isVisibleInTfmUtilisationReports: true,
          utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
        },
      ]);
      jest.mocked(api.getUtilisationReports).mockResolvedValue([existingReport]);

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
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const bankWithoutPaymentOfficerTeamEmail: BankResponse = aBank();
      bankWithoutPaymentOfficerTeamEmail.isVisibleInTfmUtilisationReports = true;
      // @ts-expect-error we are explicitly test the case where the payment officer team object is not in the expected format
      bankWithoutPaymentOfficerTeamEmail.paymentOfficerTeam = { teamName: 'Team' };
      jest.mocked(api.getAllBanks).mockResolvedValue([bankWithoutPaymentOfficerTeamEmail]);

      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('paymentOfficerTeam.emails property against bank is not an array or is empty'));
    });

    it('does not send an email when the bank has an invalid payment officer team email', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const invalidEmail = 'invalid-email';
      const bank = aBank();
      bank.isVisibleInTfmUtilisationReports = true;
      bank.paymentOfficerTeam.emails = [invalidEmail];
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);

      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('invalid payment officer email'));
    });

    it('does not send an email when the bank is marked as not visible in TFM Utilisation Reports', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const bank: BankResponse = { ...aBank(), isVisibleInTfmUtilisationReports: false };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
    });

    it('sends emails using the default team name when bank does not have one set', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const validEmail = 'valid-email@example.com';
      const bank = aBank();
      bank.isVisibleInTfmUtilisationReports = true;
      // @ts-expect-error we are explicitly test the case where the payment officer team object is not in the expected format
      bank.paymentOfficerTeam = { emails: [validEmail] };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);

      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('missing a payment officer team name'));

      expect(sendEmailCallback).toHaveBeenCalledTimes(1);
      expect(sendEmailCallback).toHaveBeenCalledWith(validEmail, 'Team', 'October 2023');
    });

    it('continues to send emails for other banks if sending to one bank fails', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const bankOneEmail = 'bank-one-email@example.com';
      const bankOneTeamName = 'Bank One Payment Officer Team';
      const bankOne: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        paymentOfficerTeam: { emails: [bankOneEmail], teamName: bankOneTeamName },
      };

      const bankTwoEmail = 'bank-two-email@example.com';
      const bankTwoTeamName = 'Bank Two Payment Officer Team';
      const bankTwo: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        paymentOfficerTeam: { emails: [bankTwoEmail], teamName: bankTwoTeamName },
      };

      jest.mocked(api.getAllBanks).mockResolvedValue([bankOne, bankTwo]);

      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn().mockRejectedValueOnce(new Error('Failed to send!')).mockResolvedValue(undefined);

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).toHaveBeenCalledTimes(2);
      expect(sendEmailCallback).toHaveBeenCalledWith(bankOneEmail, bankOneTeamName, 'October 2023');
      expect(sendEmailCallback).toHaveBeenCalledWith(bankTwoEmail, bankTwoTeamName, 'October 2023');
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send'), expect.any(Error));
    });

    it('sends emails to all banks', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      const validBarclaysEmail = 'valid-barclays-email@example.com';
      const validBarclaysTeamName = 'Barclays Payment Officer Team';
      const validBarclaysBank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        paymentOfficerTeam: { emails: [validBarclaysEmail], teamName: validBarclaysTeamName },
      };

      const validHsbcEmail = 'valid-hsbc-email@example.com';
      const otherValidHsbcEmail = 'another-valid-hsbc-email@example.com';
      const validHsbcTeamName = 'HSBC Payment Officer Team';
      const validHsbcBank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        paymentOfficerTeam: { emails: [validHsbcEmail, otherValidHsbcEmail], teamName: validHsbcTeamName },
      };

      jest.mocked(api.getAllBanks).mockResolvedValue([validBarclaysBank, validHsbcBank]);

      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).toHaveBeenCalledTimes(3);
      expect(sendEmailCallback).toHaveBeenCalledWith(validBarclaysEmail, validBarclaysTeamName, 'October 2023');
      expect(sendEmailCallback).toHaveBeenCalledWith(validHsbcEmail, validHsbcTeamName, 'October 2023');
      expect(sendEmailCallback).toHaveBeenCalledWith(otherValidHsbcEmail, validHsbcTeamName, 'October 2023');
    });

    it('does not send email if it is not the submission month for bank with quarterly reporting schedule', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      // Current month within test is November which is not the submission month for any of the following report periods
      const quarterlyReportingSchedule = [
        { startMonth: 12, endMonth: 2 },
        { startMonth: 3, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 11 },
      ];
      const bank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: quarterlyReportingSchedule,
      };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('report is not due this month, current reporting period for bank is June to August 2023'),
      );
      expect(sendEmailCallback).not.toHaveBeenCalled();
    });

    it('sends email for bank with quarterly reporting schedule if it is the submission month for a report period and the report has not been submitted', async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      // Current month within test is November which is the submission month for the August to October report period
      const quarterlyReportingSchedule = [
        { startMonth: 11, endMonth: 1 },
        { startMonth: 2, endMonth: 4 },
        { startMonth: 5, endMonth: 7 },
        { startMonth: 8, endMonth: 10 },
      ];
      const email = 'test-bank-email@ukexportfinance.gov.uk';
      const teamName = 'My Bank';
      const bank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: quarterlyReportingSchedule,
        paymentOfficerTeam: { emails: [email], teamName },
      };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);
      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).toHaveBeenCalledTimes(1);
      expect(sendEmailCallback).toHaveBeenCalledWith(email, teamName, 'August to October 2023');
    });

    it("catches error and doesn't send an email if bank reporting schedule is not parsable", async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      // @ts-expect-error we are explicitly test the case where the report schedule is not parsable
      const badReportingSchedule: BankReportPeriodSchedule = [{ notAReportPeriod: 'this is not parseable' }];
      const email = 'test-bank-email@ukexportfinance.gov.uk';
      const teamName = 'My Bank';
      const bank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: badReportingSchedule,
        paymentOfficerTeam: { emails: [email], teamName },
      };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);
      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send'), expect.any(Error));
    });

    it("catches error and doesn't send an email if bank reporting schedule is missing", async () => {
      // Arrange
      jest.mocked(externalApi.bankHolidays).getBankHolidayDatesForRegion.mockResolvedValue([]);

      // @ts-expect-error we are explicitly test the case where the report schedule is not parsable
      const badReportingSchedule: BankReportPeriodSchedule = undefined;
      const email = 'test-bank-email@ukexportfinance.gov.uk';
      const teamName = 'My Bank';
      const bank: BankResponse = {
        ...aBank(),
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: badReportingSchedule,
        paymentOfficerTeam: { emails: [email], teamName },
      };
      jest.mocked(api.getAllBanks).mockResolvedValue([bank]);
      jest.mocked(api.getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);

      const sendEmailCallback = jest.fn();

      // Act
      await sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: '',
        sendEmailCallback,
      });

      // Assert
      expect(sendEmailCallback).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send'), expect.any(Error));
    });
  });
});
