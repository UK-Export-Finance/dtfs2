const httpMocks = require('node-mocks-http');
const { AxiosError } = require('axios');
const api = require('../../api');
const { getNextReportPeriodByBankId } = require('./next-report-period.controller');
const { MOCK_REPORT_PERIOD } = require('../../../../test-helpers/mock-utilisation-report-details');

console.error = jest.fn();

jest.mock('../../api');

describe('controllers/utilisation-report-service/next-report-period', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getNextReportPeriodByBankId', () => {
    const mockBankIdParam = '956';
    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { bankId: mockBankIdParam },
      });

    it("returns 200 response when 'api.getNextReportPeriodByBankId' returns a report period", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getNextReportPeriodByBankId.mockResolvedValue({ MOCK_REPORT_PERIOD });

      // Act
      await getNextReportPeriodByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual({ MOCK_REPORT_PERIOD });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
    });

    it("returns an error response when 'api.getNextReportPeriodByBankId' returns an error response", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = 404;
      api.getNextReportPeriodByBankId.mockRejectedValue(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: errorStatus,
        }),
      );

      // Act
      await getNextReportPeriodByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toBe(errorStatus);
    });
  });
});
