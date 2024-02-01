const httpMocks = require('node-mocks-http');
const api = require('../../api');
const { getDueReportPeriodsByBankId } = require('./due-report-periods.controller');
const MOCK_UTILISATION_REPORT = require('../../../../test-helpers/mock-utilisation-reports');

jest.mock('../../api');

describe('controllers/utilisation-report-service/due-report-periods', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDueReportPeriodsByBankId', () => {
    const mockBankIdParam = '956';
    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { bankId: mockBankIdParam },
      });

    it("returns 200 response when 'api.getUtilisationReports' returns an empty array", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReports.mockResolvedValue([]);

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual([]);

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
    });

    it("returns 200 response when 'api.getUtilisationReports' returns an array of reports", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReports.mockResolvedValue([{ ...MOCK_UTILISATION_REPORT, status: 'REPORT_NOT_RECEIVED' }]);

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual([MOCK_UTILISATION_REPORT.reportPeriod]);

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
    });
  });
});
