import httpMocks from 'node-mocks-http';
import api from '../../../api';
import { getUtilisationReportByBankId } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../../test-mocks/mock-utilisation-report-reconciliation-summary';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getIsoMonth } from '../../../helpers/date';

jest.mock('../../../api');
jest.mock('../../../helpers/date');

console.error = jest.fn();

describe('controllers/utilisation-reports/utilisation-report-for-bank', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportByBankId', () => {
    const session = {
      user: MOCK_TFM_SESSION_USER,
      userToken: 'user-token',
    };

    it("redirects to '/not-found' if reconciliation summary does not include the current submission month", async () => {
      // Arrange
      const bankId = '123';
      const { req, res } = httpMocks.createMocks({
        session, params: { bankId },
      });

      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue([]);

      // Act
      await getUtilisationReportByBankId(req, res);
    
      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
    
    it("redirects to '/not-found' if reconciliation summary does not contain a report for the requested bank", async () => {
      // Arrange
      const bankId = '123';
      const { req, res } = httpMocks.createMocks({
        session, params: { bankId },
      });

      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReportByBankId(req, res);
    
      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
    
    it("renders the 'utilisation-report-for-bank' page with the correct data", async () => {
      // Arrange
      const { submissionMonth } = MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY[0];
      const { bank } = MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY[0].items[0];
      const { req, res } = httpMocks.createMocks({
        session, params: { bankId: bank.id },
      });

      jest.mocked(getIsoMonth).mockReturnValue(submissionMonth);
      jest.mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReportByBankId(req, res);
    
      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-for-bank.njk');
      expect(res._getRenderData()).toEqual({
        user: MOCK_TFM_SESSION_USER,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank,
      });
      /* eslint-enable no-underscore-dangle */
    });
  });
});
