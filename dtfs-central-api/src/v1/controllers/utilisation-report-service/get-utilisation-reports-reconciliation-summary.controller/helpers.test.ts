import { UtilisationReportEntity, UtilisationReportEntityMockBuilder, Bank, FeeRecordEntity, FeeRecordEntityMockBuilder } from '@ukef/dtfs2-common';
import { MOCK_BANKS } from '../../../../../api-tests/mocks/banks';
import { UtilisationReportRepo, getOneUtilisationReportDetailsByBankId } from '../../../../repositories/utilisation-reports-repo';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { getAllReportsForSubmissionMonth, getPreviousOpenReportsBySubmissionMonth } from './helpers';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';

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
      const banks: Bank[] = [MOCK_BANKS.BARCLAYS];

      jest.mocked(getOneUtilisationReportDetailsByBankId).mockResolvedValue(null);
      jest.spyOn(UtilisationReportRepo, 'findOpenReportsBeforeReportPeriodStartForBankId').mockResolvedValue([]);

      const expectedError = new Error(`Failed to get report for bank with id ${MOCK_BANKS.BARCLAYS.id} for submission month ${submissionMonth}`);

      // Act/Assert
      await expect(getAllReportsForSubmissionMonth(banks, submissionMonth)).rejects.toThrow(expectedError);
    });

    it('returns the reconciliation summary for all banks', async () => {
      // Arrange
      const banks = [MOCK_BANKS.BARCLAYS, MOCK_BANKS.HSBC];

      const barclaysReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withBankId(MOCK_BANKS.BARCLAYS.id).build();
      const hsbcReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withBankId(MOCK_BANKS.HSBC.id).build();

      // eslint-disable-next-line @typescript-eslint/require-await
      jest.spyOn(UtilisationReportRepo, 'findOneByBankIdAndReportPeriod').mockImplementation(async (bankId) => {
        switch (bankId) {
          case MOCK_BANKS.BARCLAYS.id:
            return barclaysReport;
          case MOCK_BANKS.HSBC.id:
            return hsbcReport;
          default:
            return null;
        }
      });
      jest.spyOn(FeeRecordRepo, 'findByReport').mockImplementation((report) => Promise.resolve([getMockFeeRecordForReport(report)]));

      jest.spyOn(UtilisationReportRepo, 'findOpenReportsBeforeReportPeriodStartForBankId').mockResolvedValue([]);

      // Act
      const result = await getAllReportsForSubmissionMonth(banks, submissionMonth);

      // Assert
      expect(result).toEqual<UtilisationReportReconciliationSummary>({
        submissionMonth,
        items: [
          {
            reportId: barclaysReport.id,
            bank: { id: MOCK_BANKS.BARCLAYS.id, name: MOCK_BANKS.BARCLAYS.name },
            status: barclaysReport.status,
            dateUploaded: barclaysReport.dateUploaded ?? undefined,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
          {
            reportId: hsbcReport.id,
            bank: { id: MOCK_BANKS.HSBC.id, name: MOCK_BANKS.HSBC.name },
            status: hsbcReport.status,
            dateUploaded: hsbcReport.dateUploaded ?? undefined,
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
      const banks: Bank[] = [MOCK_BANKS.BARCLAYS];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      const augustPeriodReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
        .withBankId(MOCK_BANKS.BARCLAYS.id)
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

      const septemberPeriodReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withBankId(MOCK_BANKS.BARCLAYS.id)
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

      const octoberPeriodReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
        .withBankId(MOCK_BANKS.BARCLAYS.id)
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

      const openReports: UtilisationReportEntity[] = [augustPeriodReport, septemberPeriodReport, octoberPeriodReport];

      jest.spyOn(UtilisationReportRepo, 'findOpenReportsBeforeReportPeriodStartForBankId').mockResolvedValue(openReports);
      jest.spyOn(FeeRecordRepo, 'findByReport').mockImplementation((report) => Promise.resolve([getMockFeeRecordForReport(report)]));

      // Act
      const result = await getPreviousOpenReportsBySubmissionMonth(banks, currentSubmissionMonth);

      // Assert
      expect(result).toEqual([
        // submissionMonth: '2023-12' (2023-11 report period) is the current submission month, so should not appear
        {
          submissionMonth: '2023-11', // 2023-10 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'REPORT_NOT_RECEIVED',
            }),
          ],
        },
        {
          submissionMonth: '2023-10', // 2023-09 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'PENDING_RECONCILIATION',
            }),
          ],
        },
        {
          submissionMonth: '2023-09', // 2023-08 report period
          items: [
            expect.objectContaining<Partial<UtilisationReportReconciliationSummaryItem>>({
              status: 'RECONCILIATION_IN_PROGRESS',
            }),
          ],
        },
      ]);
    });

    const getOpenReport = ({ bank, month }: { bank: Bank; month: number }): UtilisationReportEntity =>
      UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withBankId(bank.id)
        .withReportPeriod({
          start: {
            month,
            year: 2023,
          },
          end: {
            month,
            year: 2023,
          },
        })
        .build();

    it('orders results by submissionMonth then bank name', async () => {
      const bankA: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'A', name: 'Bank A' };
      const bankB: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'B', name: 'Bank B' };
      const bankC: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'C', name: 'Bank C' };

      const banks: Bank[] = [bankB, bankA, bankC];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.spyOn(UtilisationReportRepo, 'findOpenReportsBeforeReportPeriodStartForBankId').mockImplementation((bankId, _) => {
        switch (bankId) {
          case bankA.id:
            return Promise.resolve([getOpenReport({ bank: bankA, month: 10 })]);
          case bankB.id:
            return Promise.resolve([
              getOpenReport({ bank: bankB, month: 10 }),
              getOpenReport({ bank: bankB, month: 9 }),
              getOpenReport({ bank: bankB, month: 8 }),
            ]);
          case bankC.id:
            return Promise.resolve([getOpenReport({ bank: bankC, month: 9 }), getOpenReport({ bank: bankC, month: 10 })]);
          default:
            throw new Error(`unexpected bankId ${bankId}`);
        }
      });

      jest.spyOn(FeeRecordRepo, 'findByReport').mockImplementation((report) => Promise.resolve([getMockFeeRecordForReport(report)]));

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
  });
});
