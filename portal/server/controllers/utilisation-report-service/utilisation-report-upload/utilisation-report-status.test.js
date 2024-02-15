const { getDueReportPeriodsByBankId } = require('./utilisation-report-status');
const api = require('../../../api');

jest.mock('../../../api');

describe('utilisation-report-status', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDueReportPeriodsByBankId', () => {
    const userToken = 'test';
    const bankId = '1';

    it('should return due report periods array with formatted report period string', async () => {
      const expectedDueReportPeriods = [
        {
          start: {
            month: 12,
            year: 2022,
          },
          end: {
            month: 12,
            year: 2022,
          },
          formattedReportPeriod: 'December 2022',
        },
        {
          start: {
            month: 1,
            year: 2023,
          },
          end: {
            month: 1,
            year: 2023,
          },
          formattedReportPeriod: 'January 2023',
        },
        {
          start: {
            month: 2,
            year: 2023,
          },
          end: {
            month: 2,
            year: 2023,
          },
          formattedReportPeriod: 'February 2023',
        },
      ];

      const mockDueDatesByBank = expectedDueReportPeriods.map((expectedDueReportPeriod) => ({
        start: expectedDueReportPeriod.start,
        end: expectedDueReportPeriod.end,
      }));

      jest.mocked(api.getDueReportPeriodsByBankId).mockReturnValueOnce(mockDueDatesByBank);

      const response = await getDueReportPeriodsByBankId(userToken, bankId);
      expect(response).toEqual(expectedDueReportPeriods);
    });

    it('should return empty array if due reports array is empty', async () => {
      const expectedDueReportPeriods = [];
      const mockDueDatesByBank = [];

      jest.mocked(api.getDueReportPeriodsByBankId).mockReturnValueOnce(mockDueDatesByBank);

      const response = await getDueReportPeriodsByBankId(userToken, bankId);
      expect(response).toEqual(expectedDueReportPeriods);
    });
  });
});
