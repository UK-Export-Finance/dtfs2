const httpMocks = require('node-mocks-http');
const api = require('../../api');
const { getUtilisationReports } = require('./index');
const MOCK_BANK_HOLIDAYS = require('../../test-mocks/mock-bank-holidays');
const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY = require('../../test-mocks/mock-utilisation-report-reconciliation-summary');

jest.mock('../../api');

console.error = jest.fn();

const originalProcessEnv = process.env;

describe('controllers/utilisation-reports', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getUtilisationReports', () => {
    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
      });

      api.getUkBankHolidays.mockRejectedValue({ response: { status: 404 } });

      // Act
      await getUtilisationReports(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      /* eslint-enable no-underscore-dangle */
    });

    it('renders the utilisation-reports.njk view with required data', async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      api.getUkBankHolidays.mockResolvedValue(MOCK_BANK_HOLIDAYS);
      api.getUtilisationReportsReconciliationSummary.mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReports(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-reports.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: 'utilisation reports',
        reportPeriod: 'October 2023',
        reportDueDate: '14 November 2023',
      });
      /* eslint-enable no-underscore-dangle */
    });
  });
});
