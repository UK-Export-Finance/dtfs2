import { UtilisationReportEntityMockBuilder, getPreviousReportPeriodForBankScheduleByMonth } from '@ukef/dtfs2-common';
import { getPreviousReportPeriod } from './get-previous-report-period';
import { getBankById } from '../repositories/banks-repo';
import { NotFoundError } from '../errors';
import { aBank } from '../../test-helpers';

jest.mock('../repositories/banks-repo');

describe('getPreviousReportPeriod', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

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

  describe('when a bank is found', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const response = await getPreviousReportPeriod(bankId, utilisationReport);

      const { start } = utilisationReport.reportPeriod;
      const paddedMonth = String(start.month).padStart(2, '0');
      const monthFormatted = `${start.year}-${paddedMonth}`;

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, monthFormatted);

      expect(response).toEqual(expected);
    });
  });
});
