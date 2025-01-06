import { getPreviousReportPeriodForBankScheduleByMonth } from '@ukef/dtfs2-common';
import { getPreviousReportPeriod } from './get-previous-report-period';
import { getBankById } from '../repositories/banks-repo';
import { NotFoundError } from '../errors';
import { aBank, aReportPeriod } from '../../test-helpers';

jest.mock('../repositories/banks-repo');

describe('getPreviousReportPeriod', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockGetBankByIdResponse = aBank();
  const bankId = '1234';
  const notFoundError = new NotFoundError(`Bank not found: ${bankId}`);

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(getPreviousReportPeriod(bankId, aReportPeriod())).rejects.toThrow(new Error());
    });
  });

  describe('when getBankById returns no bank', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(null));
    });

    it('should throw an error', async () => {
      await expect(getPreviousReportPeriod(bankId, aReportPeriod())).rejects.toThrow(notFoundError);
    });
  });

  describe('when a bank is found and the start month of the report period has 1 digit', () => {
    const reportPeriod = { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } };

    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const response = await getPreviousReportPeriod(bankId, reportPeriod);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-02');

      expect(response).toEqual(expected);
    });
  });

  describe('when a bank is found and the start month of the report period has 2 digits', () => {
    const reportPeriod = { start: { month: 10, year: 2024 }, end: { month: 4, year: 2024 } };

    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(mockGetBankByIdResponse));
    });

    it('should return the result of getPreviousReportPeriodForBankScheduleByMonth', async () => {
      const response = await getPreviousReportPeriod(bankId, reportPeriod);

      const expected = getPreviousReportPeriodForBankScheduleByMonth(mockGetBankByIdResponse.utilisationReportPeriodSchedule, '2024-10');

      expect(response).toEqual(expected);
    });
  });
});
