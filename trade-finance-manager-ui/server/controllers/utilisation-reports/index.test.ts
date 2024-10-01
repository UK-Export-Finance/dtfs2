import httpMocks from 'node-mocks-http';
import * as dtfs2Common from '@ukef/dtfs2-common';
import api from '../../api';
import { getUtilisationReports } from '.';
import { MOCK_BANK_HOLIDAYS } from '../../test-mocks/mock-bank-holidays';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../test-mocks/mock-utilisation-report-reconciliation-summary';
import { MOCK_TFM_SESSION_USER } from '../../test-mocks/mock-tfm-session-user';
import { getReportReconciliationSummariesViewModel, isPDCReconcileUser } from './helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../constants';

jest.mock('../../api');

console.error = jest.fn();

const originalProcessEnv = { ...process.env };

describe('controllers/utilisation-reports', () => {
  const isTfmPaymentReconciliationFeatureFlagEnabledSpy = jest.spyOn(dtfs2Common, 'isTfmPaymentReconciliationFeatureFlagEnabled');

  afterEach(() => {
    process.env = originalProcessEnv;
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getUtilisationReports', () => {
    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_TFM_SESSION_USER },
      });

      jest.mocked(api.getUkBankHolidays).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getUtilisationReports(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it('renders the view with required data', async () => {
      // Arrange
      const userToken = 'user-token';

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      jest.mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);
      const expectedViewModel = await getReportReconciliationSummariesViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY, userToken);

      // Act
      await getUtilisationReports(req, res);

      // Assert
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        reportPeriodSummaries: expectedViewModel,
        isPDCReconcileUser: isPDCReconcileUser(MOCK_TFM_SESSION_USER),
      });
    });

    it('renders the utilisation-reports-manual-reconciliation.njk view when the payments reconciliation feature is disabled', async () => {
      // Arrange
      const userToken = 'user-token';

      const isTfmPaymentReconciliationFeatureFlagEnabledValue = false;
      isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(isTfmPaymentReconciliationFeatureFlagEnabledValue);

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

      jest.mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReports(req, res);

      // Assert
      expect(isTfmPaymentReconciliationFeatureFlagEnabledSpy).toHaveBeenCalled();
      expect(res._getRenderView()).toEqual(`utilisation-reports/utilisation-reports-manual-reconciliation.njk`);
    });

    it('renders the utilisation-reports.njk view when the payments reconciliation feature is enabled', async () => {
      // Arrange
      const userToken = 'user-token';

      const isTfmPaymentReconciliationFeatureFlagEnabledValue = true;
      isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(isTfmPaymentReconciliationFeatureFlagEnabledValue);

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

      jest.mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReports(req, res);

      // Assert
      expect(isTfmPaymentReconciliationFeatureFlagEnabledSpy).toHaveBeenCalled();
      expect(res._getRenderView()).toEqual(`utilisation-reports/utilisation-reports.njk`);
    });
  });
});
