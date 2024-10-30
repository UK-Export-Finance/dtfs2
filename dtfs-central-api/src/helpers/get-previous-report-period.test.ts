import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getPreviousReportPeriodForBankScheduleByMonth,
} from '@ukef/dtfs2-common';
import { getPreviousReportPeriod } from './get-previous-report-period';
import { getBankById } from '../repositories/banks-repo';
import { NotFoundError } from '../errors';
import { aBank } from '../../test-helpers';

jest.mock('../repositories/banks-repo');

describe('getPreviousReportPeriod', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

  const mockGetBankByIdResponse = aBank();
  const bankId = '1234';
  const notFoundError = new NotFoundError(`Bank not found: ${bankId}`);

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(getPreviousReportPeriod(bankId, utilisationReport)).rejects.toThrow(new Error());
    });
  });

  describe('when getBankById returns no bank', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(null));
    });

    it('should throw an error', async () => {
      await expect(getPreviousReportPeriod(bankId, utilisationReport)).rejects.toThrow(notFoundError);
    });
  });

  describe('when a bank is found and the month has 1 digit', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const reportPeriod = { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } };
      const utilisationReportSingleDigitMonth = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withReportPeriod(reportPeriod)
        .build();
      const response = await getPreviousReportPeriod(bankId, utilisationReportSingleDigitMonth);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-02');

      expect(response).toEqual(expected);
    });
  });

  describe('when a bank is found and the start month of the report period has 2 digits', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const reportPeriod = { start: { month: 10, year: 2024 }, end: { month: 4, year: 2024 } };
      const utilisationReportTwoDigitMonth = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withReportPeriod(reportPeriod)
        .build();
      const response = await getPreviousReportPeriod(bankId, utilisationReportTwoDigitMonth);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-10');

      expect(response).toEqual(expected);
    });
  });

  describe('when a bank is found and the start month of the report period has 1 digits but starts with 0', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const reportPeriod = { start: { month: 0o3, year: 2024 }, end: { month: 4, year: 2024 } };
      const utilisationReportZeroStartMonth = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withReportPeriod(reportPeriod)
        .build();
      const response = await getPreviousReportPeriod(bankId, utilisationReportZeroStartMonth);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-03');

      expect(response).toEqual(expected);
    });
  });
});
