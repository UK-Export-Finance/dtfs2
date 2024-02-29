import { Bank, UtilisationReport } from '@ukef/dtfs2-common';
import { MOCK_BANKS } from '../../../../../api-tests/mocks/banks';
import { getOpenReportsBeforeReportPeriodForBankId, getOneUtilisationReportDetailsByBankId } from '../../../../repositories/utilisation-reports-repo';
import { MOCK_UTILISATION_REPORT } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-reports';
import { getMockUtilisationDataForReport } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-data';
import { getAllUtilisationDataForReport } from '../../../../repositories/utilisation-data-repo';
import { getAllReportsForSubmissionMonth, getPreviousOpenReportsBySubmissionMonth } from './helpers';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';

jest.mock('../../../../repositories/banks-repo');
jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/utilisation-data-repo');

describe('get-utilisation-reports-reconciliation-summary.controller helper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllReportsForSubmissionMonth', () => {
    const submissionMonth: IsoMonthStamp = '2024-01';

    it('throws an error when the report for the current submission month does not exist', async () => {
      // Arrange
      const banks: Bank[] = [MOCK_BANKS.BARCLAYS];

      jest.mocked(getOneUtilisationReportDetailsByBankId).mockResolvedValue(null);
      jest.mocked(getOpenReportsBeforeReportPeriodForBankId).mockResolvedValue([]);

      const expectedError = new Error(`Failed to get report for bank with id ${MOCK_BANKS.BARCLAYS.id} for submission month ${submissionMonth}`);

      // Act/Assert
      await expect(getAllReportsForSubmissionMonth(banks, submissionMonth)).rejects.toThrow(expectedError);
    });

    it('returns the reconciliation summary for all banks', async () => {
      // Arrange
      const banks = [MOCK_BANKS.BARCLAYS, MOCK_BANKS.HSBC];

      const barclaysReport: UtilisationReport = {
        ...MOCK_UTILISATION_REPORT,
        bank: { id: MOCK_BANKS.BARCLAYS.id, name: MOCK_BANKS.BARCLAYS.name },
        status: 'RECONCILIATION_IN_PROGRESS',
      };
      const hsbcReport: UtilisationReport = {
        ...MOCK_UTILISATION_REPORT,
        bank: { id: MOCK_BANKS.HSBC.id, name: MOCK_BANKS.HSBC.name },
        status: 'PENDING_RECONCILIATION',
      };
      // eslint-disable-next-line @typescript-eslint/require-await
      jest.mocked(getOneUtilisationReportDetailsByBankId).mockImplementation(async (bankId) => {
        switch (bankId) {
          case MOCK_BANKS.BARCLAYS.id:
            return barclaysReport;
          case MOCK_BANKS.HSBC.id:
            return hsbcReport;
          default:
            return null;
        }
      });

      jest.mocked(getAllUtilisationDataForReport).mockImplementation((report) => Promise.resolve([getMockUtilisationDataForReport(report)]));

      jest.mocked(getOpenReportsBeforeReportPeriodForBankId).mockResolvedValue([]);

      // Act
      const result = await getAllReportsForSubmissionMonth(banks, submissionMonth);

      // Assert
      expect(result).toEqual<UtilisationReportReconciliationSummary>({
        submissionMonth,
        items: [
          {
            reportId: barclaysReport._id,
            bank: barclaysReport.bank,
            status: barclaysReport.status,
            dateUploaded: barclaysReport.dateUploaded,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
          {
            reportId: hsbcReport._id,
            bank: hsbcReport.bank,
            status: hsbcReport.status,
            dateUploaded: hsbcReport.dateUploaded,
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

      const augustPeriodReport: UtilisationReport = {
        ...MOCK_UTILISATION_REPORT,
        bank: MOCK_BANKS.BARCLAYS,
        status: 'RECONCILIATION_IN_PROGRESS',
        reportPeriod: {
          start: {
            month: 8,
            year: 2023,
          },
          end: {
            month: 8,
            year: 2023,
          },
        },
      };

      const septemberPeriodReport: UtilisationReport = {
        ...MOCK_UTILISATION_REPORT,
        bank: MOCK_BANKS.BARCLAYS,
        status: 'PENDING_RECONCILIATION',
        reportPeriod: {
          start: {
            month: 9,
            year: 2023,
          },
          end: {
            month: 9,
            year: 2023,
          },
        },
      };

      const octoberPeriodReport: UtilisationReport = {
        ...MOCK_UTILISATION_REPORT,
        bank: MOCK_BANKS.BARCLAYS,
        status: 'REPORT_NOT_RECEIVED',
        reportPeriod: {
          start: {
            month: 10,
            year: 2023,
          },
          end: {
            month: 10,
            year: 2023,
          },
        },
      };

      const openReports: UtilisationReport[] = [augustPeriodReport, septemberPeriodReport, octoberPeriodReport];

      jest.mocked(getOpenReportsBeforeReportPeriodForBankId).mockResolvedValue(openReports);
      jest.mocked(getAllUtilisationDataForReport).mockImplementation((report) => Promise.resolve([getMockUtilisationDataForReport(report)]));

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

    const getOpenReport = ({ bank, month }: { bank: Bank; month: number }): UtilisationReport => ({
      ...MOCK_UTILISATION_REPORT,
      bank,
      reportPeriod: {
        start: {
          month,
          year: 2023,
        },
        end: {
          month,
          year: 2023,
        },
      },
      status: 'PENDING_RECONCILIATION',
    });

    it('orders results by submissionMonth then bank name', async () => {
      const bankA: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'A', name: 'Bank A' };
      const bankB: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'B', name: 'Bank B' };
      const bankC: Bank = { ...MOCK_BANKS.BARCLAYS, id: 'C', name: 'Bank C' };

      const banks: Bank[] = [bankB, bankA, bankC];
      const currentSubmissionMonth: IsoMonthStamp = '2023-12';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.mocked(getOpenReportsBeforeReportPeriodForBankId).mockImplementation((_, bankId) => {
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

      jest.mocked(getAllUtilisationDataForReport).mockImplementation((report) => Promise.resolve([getMockUtilisationDataForReport(report)]));

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
