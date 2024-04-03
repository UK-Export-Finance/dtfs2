import {
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  Bank,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  ReportPeriod,
} from '@ukef/dtfs2-common';

import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { getAllReportsForSubmissionMonth, getPreviousOpenReportsBySubmissionMonth } from './helpers';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';
import { aBank } from '../../../../../test-helpers/test-data/bank';
import { aMonthlyBankReportPeriodSchedule } from '../../../../../test-helpers/test-data/bank-report-period-schedule';

jest.mock('../../../../repositories/banks-repo');
jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/utilisation-data-repo');

describe('get-utilisation-reports-reconciliation-summary.controller helper', () => {
  const getMockFeeRecordForReport = (report: UtilisationReportEntity): FeeRecordEntity => FeeRecordEntityMockBuilder.forReport(report).build();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllReportsForSubmissionMonth', () => {
    const submissionMonth: IsoMonthStamp = '2024-01';

    it('throws an error when the report for the current submission month does not exist', async () => {
      // Arrange
      const banks: Bank[] = [aBank()];

      jest.spyOn(UtilisationReportRepo, 'findOpenReportsForBankIdWithReportPeriodEndBefore').mockResolvedValue([]);

      const expectedError = new Error(`Failed to get report for bank with id ${banks[0].id} for submission month ${submissionMonth}`);

      // Act/Assert
      await expect(getAllReportsForSubmissionMonth(banks, submissionMonth)).rejects.toThrow(expectedError);
    });

    it('fetches and returns the reconciliation summary for all banks', async () => {
      // Arrange
      const bankIdOne = '1';
      const bankIdTwo = '2';
      const bankNameOne = 'Barclays';
      const bankNameTwo = 'HSBC';
      const banks: Bank[] = [
        { ...aBank(), id: bankIdOne, name: bankNameOne, utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() },
        {
          ...aBank(),
          id: bankIdTwo,
          name: bankNameTwo,
          utilisationReportPeriodSchedule: [
            { startMonth: 1, endMonth: 3 },
            { startMonth: 4, endMonth: 6 },
            { startMonth: 7, endMonth: 9 },
            { startMonth: 10, endMonth: 12 },
          ],
        },
      ];

      const reportOne = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
        .withBankId(bankIdOne)
        .withReportPeriod({ start: { month: 12, year: 2023 }, end: { month: 12, year: 2023 } })
        .build();
      reportOne.feeRecords = [getMockFeeRecordForReport(reportOne)];
      const reportTwo = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withBankId(bankIdTwo)
        .withReportPeriod({ start: { month: 10, year: 2023 }, end: { month: 12, year: 2023 } })
        .build();
      reportTwo.feeRecords = [getMockFeeRecordForReport(reportTwo)];

      // eslint-disable-next-line @typescript-eslint/require-await
      const findOneByBankIdAndReportPeriodSpy = jest.spyOn(UtilisationReportRepo, 'findOneByBankIdAndReportPeriod').mockImplementation(async (bankId) => {
        switch (bankId) {
          case bankIdOne:
            return reportOne;
          case bankIdTwo:
            return reportTwo;
          default:
            return null;
        }
      });

      jest.spyOn(UtilisationReportRepo, 'findOpenReportsForBankIdWithReportPeriodEndBefore').mockResolvedValue([]);

      // Act
      const result = await getAllReportsForSubmissionMonth(banks, submissionMonth);

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(bankIdOne, {
        start: { month: 12, year: 2023 },
        end: { month: 12, year: 2023 },
      });
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(bankIdTwo, {
        start: { month: 10, year: 2023 },
        end: { month: 12, year: 2023 },
      });
      expect(result).toEqual<UtilisationReportReconciliationSummary>({
        submissionMonth,
        items: [
          {
            reportId: reportOne.id,
            reportPeriod: reportOne.reportPeriod,
            bank: { id: bankIdOne, name: bankNameOne },
            status: reportOne.status,
            dateUploaded: reportOne.dateUploaded ?? undefined,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
          {
            reportId: reportTwo.id,
            reportPeriod: reportTwo.reportPeriod,
            bank: { id: bankIdTwo, name: bankNameTwo },
            status: reportTwo.status,
            dateUploaded: reportTwo.dateUploaded ?? undefined,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
        ],
      });
    });
  });

  describe('getPreviousOpenReportsBySubmissionMonth', () => {
    it('returns all the previous reports', async () => {
      // Arrange
      const banks: Bank[] = [{ ...aBank(), utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() }];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      const augustPeriodReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
        .withBankId(banks[0].id)
        .withReportPeriod({
          start: {
            month: 8,
            year: 2023,
          },
          end: {
            month: 8,
            year: 2023,
          },
        })
        .build();
      augustPeriodReport.feeRecords = [getMockFeeRecordForReport(augustPeriodReport)];

      const septemberPeriodReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withBankId(banks[0].id)
        .withReportPeriod({
          start: {
            month: 9,
            year: 2023,
          },
          end: {
            month: 9,
            year: 2023,
          },
        })
        .build();
      septemberPeriodReport.feeRecords = [getMockFeeRecordForReport(septemberPeriodReport)];

      const octoberPeriodReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
        .withBankId(banks[0].id)
        .withReportPeriod({
          start: {
            month: 10,
            year: 2023,
          },
          end: {
            month: 10,
            year: 2023,
          },
        })
        .build();
      octoberPeriodReport.feeRecords = [getMockFeeRecordForReport(octoberPeriodReport)];

      const openReports: UtilisationReportEntity[] = [augustPeriodReport, septemberPeriodReport, octoberPeriodReport];

      jest.spyOn(UtilisationReportRepo, 'findOpenReportsForBankIdWithReportPeriodEndBefore').mockResolvedValue(openReports);

      // Act
      const result = await getPreviousOpenReportsBySubmissionMonth(banks, currentSubmissionMonth);

      // Assert
      expect(result).toEqual([
        // submissionMonth: '2023-12' is the current submission month, so should not appear
        {
          submissionMonth: '2023-11',
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'REPORT_NOT_RECEIVED',
            }),
          ],
        },
        {
          submissionMonth: '2023-10',
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'PENDING_RECONCILIATION',
            }),
          ],
        },
        {
          submissionMonth: '2023-09',
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'RECONCILIATION_IN_PROGRESS',
            }),
          ],
        },
      ]);
    });

    const getOpenReportWithReportPeriod = (bank: Bank, reportPeriod: ReportPeriod): UtilisationReportEntity => {
      const openReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withBankId(bank.id).withReportPeriod(reportPeriod).build();
      openReport.feeRecords = [getMockFeeRecordForReport(openReport)];
      return openReport;
    };

    const getOpenMonthlyReport = ({ bank, month }: { bank: Bank; month: number }): UtilisationReportEntity =>
      getOpenReportWithReportPeriod(bank, {
        start: {
          month,
          year: 2023,
        },
        end: {
          month,
          year: 2023,
        },
      });

    it('orders results by submissionMonth then bank name', async () => {
      const bankA: Bank = { ...aBank(), id: 'A', name: 'Bank A', utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() };
      const bankB: Bank = { ...aBank(), id: 'B', name: 'Bank B', utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() };
      const bankC: Bank = { ...aBank(), id: 'C', name: 'Bank C', utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() };

      const banks: Bank[] = [bankB, bankA, bankC];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.spyOn(UtilisationReportRepo, 'findOpenReportsForBankIdWithReportPeriodEndBefore').mockImplementation((bankId, _) => {
        switch (bankId) {
          case bankA.id:
            return Promise.resolve([getOpenMonthlyReport({ bank: bankA, month: 10 })]);
          case bankB.id:
            return Promise.resolve([
              getOpenMonthlyReport({ bank: bankB, month: 10 }),
              getOpenMonthlyReport({ bank: bankB, month: 9 }),
              getOpenMonthlyReport({ bank: bankB, month: 8 }),
            ]);
          case bankC.id:
            return Promise.resolve([getOpenMonthlyReport({ bank: bankC, month: 9 }), getOpenMonthlyReport({ bank: bankC, month: 10 })]);
          default:
            throw new Error(`unexpected bankId ${bankId}`);
        }
      });

      // Act
      const result = await getPreviousOpenReportsBySubmissionMonth(banks, currentSubmissionMonth);

      // Assert
      expect(result).toEqual([
        // submissionMonth: '2023-12' (2023-11 report period) is the current submission month, so should not appear
        {
          submissionMonth: '2023-11', // 2023-10 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankA.id, name: bankA.name },
            }),
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankB.id, name: bankB.name },
            }),
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankC.id, name: bankC.name },
            }),
          ],
        },
        {
          submissionMonth: '2023-10', // 2023-09 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankB.id, name: bankB.name },
            }),
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankC.id, name: bankC.name },
            }),
          ],
        },
        {
          submissionMonth: '2023-09', // 2023-08 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              bank: { id: bankB.id, name: bankB.name },
            }),
          ],
        },
      ]);
    });

    it('groups quarterly reports with monthly reports based on end month', async () => {
      const bankA: Bank = { ...aBank(), id: 'A', name: 'Bank A', utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule() };
      const bankB: Bank = {
        ...aBank(),
        id: 'B',
        name: 'Bank B',
        utilisationReportPeriodSchedule: [
          { startMonth: 1, endMonth: 3 },
          { startMonth: 4, endMonth: 6 },
          { startMonth: 7, endMonth: 9 },
          { startMonth: 10, endMonth: 12 },
        ],
      };

      const banks: Bank[] = [bankB, bankA];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      const findOpenReportsForBankIdWithReportPeriodEndBeforeSpy = jest
        .spyOn(UtilisationReportRepo, 'findOpenReportsForBankIdWithReportPeriodEndBefore')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((bankId, _) => {
          switch (bankId) {
            case bankA.id:
              return Promise.resolve([
                getOpenMonthlyReport({ bank: bankA, month: 10 }),
                getOpenMonthlyReport({ bank: bankA, month: 9 }),
                getOpenMonthlyReport({ bank: bankA, month: 8 }),
              ]);
            case bankB.id:
              return Promise.resolve([
                getOpenReportWithReportPeriod(bankB, { start: { month: 7, year: 2023 }, end: { month: 9, year: 2023 } }),
                getOpenReportWithReportPeriod(bankB, { start: { month: 4, year: 2023 }, end: { month: 6, year: 2023 } }),
              ]);
            default:
              throw new Error(`unexpected bankId ${bankId}`);
          }
        });

      // Act
      const result = await getPreviousOpenReportsBySubmissionMonth(banks, currentSubmissionMonth);

      // Assert
      expect(findOpenReportsForBankIdWithReportPeriodEndBeforeSpy).toHaveBeenCalledWith(bankA.id, { month: 11, year: 2023 });
      expect(findOpenReportsForBankIdWithReportPeriodEndBeforeSpy).toHaveBeenCalledWith(bankB.id, { month: 11, year: 2023 });
      expect(result).toEqual([
        // submissionMonth: '2023-12' (2023-11 report period) is the current submission month, so should not appear
        {
          submissionMonth: '2023-11', // 2023-10 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              reportPeriod: { start: { month: 10, year: 2023 }, end: { month: 10, year: 2023 } },
              bank: { id: bankA.id, name: bankA.name },
            }),
          ],
        },
        {
          submissionMonth: '2023-10', // 2023-09 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              reportPeriod: { start: { month: 9, year: 2023 }, end: { month: 9, year: 2023 } },
              bank: { id: bankA.id, name: bankA.name },
            }),
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              reportPeriod: { start: { month: 7, year: 2023 }, end: { month: 9, year: 2023 } },
              bank: { id: bankB.id, name: bankB.name },
            }),
          ],
        },
        {
          submissionMonth: '2023-09', // 2023-08 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              reportPeriod: { start: { month: 8, year: 2023 }, end: { month: 8, year: 2023 } },
              bank: { id: bankA.id, name: bankA.name },
            }),
          ],
        },
        {
          submissionMonth: '2023-07', // 2023-06 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              reportPeriod: { start: { month: 4, year: 2023 }, end: { month: 6, year: 2023 } },
              bank: { id: bankB.id, name: bankB.name },
            }),
          ],
        },
      ]);
    });
  });
});
