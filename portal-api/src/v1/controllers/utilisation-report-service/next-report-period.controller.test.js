const httpMocks = require('node-mocks-http');
const { AxiosError } = require('axios');
const api = require('../../api');
const { getNextReportPeriodByBankId } = require('./next-report-period.controller');
const { aReportPeriod } = require('../../../../test-helpers/test-data/report-period');

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
      const reportPeriod = aReportPeriod();
      api.getNextReportPeriodByBankId.mockResolvedValue(reportPeriod);

      // Act
      await getNextReportPeriodByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual(reportPeriod);

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
      expect(res._getStatusCode()).toEqual(errorStatus);
    });
  });
});
