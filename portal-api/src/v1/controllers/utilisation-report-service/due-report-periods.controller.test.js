const httpMocks = require('node-mocks-http');
const { AxiosError } = require('axios');
const { UTILISATION_REPORT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../api');
const { getDueReportPeriodsByBankId } = require('./due-report-periods.controller');
const { aUtilisationReportResponse } = require('../../../../test-helpers/test-data/utilisation-report');

console.error = jest.fn();

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

    it("returns a 200 response when 'api.getUtilisationReports' returns an empty array", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReports.mockResolvedValue([]);

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual([]);
    });

    it("returns a 200 response when 'api.getUtilisationReports' returns an array of reports", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReports.mockResolvedValue([{ ...aUtilisationReportResponse(), status: UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED }]);

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual([aUtilisationReportResponse().reportPeriod]);
    });

    it(`returns an empty array response when 'api.getUtilisationReports' returns no reports with the '${UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED}' status`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReports.mockResolvedValue([
        {
          ...aUtilisationReportResponse(),
          status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION,
        },
        {
          ...aUtilisationReportResponse(),
          status: UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED,
        },
      ]);

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual([]);
    });

    it("returns an error response when 'api.getUtilisationReports' returns an error response", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = 404;
      api.getUtilisationReports.mockRejectedValue(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: errorStatus,
        }),
      );

      // Act
      await getDueReportPeriodsByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(errorStatus);
    });
  });
});
