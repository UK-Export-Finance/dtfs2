import httpMocks from 'node-mocks-http';
import { mocked } from 'jest-mock';
import api from '../../api';
import { getUtilisationReports, getUtilisationReportByBankId } from '.';
import MOCK_BANK_HOLIDAYS from '../../test-mocks/mock-bank-holidays';
import {
  MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY,
  MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS,
} from '../../test-mocks/mock-utilisation-report-reconciliation-summary';

jest.mock('../../api');
jest.mock('express-validator');

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

      (api.getUkBankHolidays as jest.Mock).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getUtilisationReports(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it('renders the utilisation-reports.njk view with required data', async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
      mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

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

  describe('getUtilisationReportByBankId', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    it("should redirect to the '/not-found' page if the bank id cannot be found", async () => {
      // Arrange
      const bankId = '123';
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { bankId },
      });

      mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue([
        {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
          bank: {
            id: '321',
            name: 'Test bank',
          },
        },
      ]);

      // Act
      await getUtilisationReportByBankId(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRedirectUrl()).toEqual('/not-found');
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(`Bank with id ${bankId} not found`);
    });

    it('should render the correct page with the correct data', async () => {
      // Arrange
      const bankId = '123';
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { bankId },
      });

      const bank = {
        id: bankId,
        name: 'Test Bank',
      };
      mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue([
        {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
          bank,
        },
      ]);

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);

      // Act
      await getUtilisationReportByBankId(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-for-bank.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: 'utilisation reports',
        bank,
        reportPeriod: 'October 2023',
      });
      /* eslint-enable no-underscore-dangle */
    });
  });
});
