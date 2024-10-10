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

  let utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

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
      utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withReportPeriod(reportPeriod).build();
      const response = await getPreviousReportPeriod(bankId, utilisationReport);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-02');

      expect(response).toEqual(expected);
    });
  });

  describe('when a bank is found and the month has 2 digits', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const reportPeriod = { start: { month: 10, year: 2024 }, end: { month: 4, year: 2024 } };
      utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withReportPeriod(reportPeriod).build();
      const response = await getPreviousReportPeriod(bankId, utilisationReport);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-10');

      expect(response).toEqual(expected);
    });
  });

  describe('when a bank is found and the month has 2 digits and starts with 0', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const reportPeriod = { start: { month: 0o3, year: 2024 }, end: { month: 4, year: 2024 } };
      utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withReportPeriod(reportPeriod).build();
      const response = await getPreviousReportPeriod(bankId, utilisationReport);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-03');

      expect(response).toEqual(expected);
    });
  });
});
