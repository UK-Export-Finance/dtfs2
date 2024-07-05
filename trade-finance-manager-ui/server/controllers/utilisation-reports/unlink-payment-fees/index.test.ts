import httpMocks from 'node-mocks-http';
import { postUnlinkPaymentFees } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import { getEditPremiumPaymentsCheckboxIdsFromObjectKeys } from '../../../helpers/edit-premium-payments-table-checkbox-id-helper';

console.error = jest.fn();

jest.mock('../../../helpers/edit-premium-payments-table-checkbox-id-helper');

describe('controllers/utilisation-reports/unlink-payment-fees', () => {
  describe('postUnlinkPaymentFees', () => {
    const userToken = 'abc123';
    const requestSession = {
      user: aTfmSessionUser(),
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("redirects to '/utilisation-reports/:reportId/edit-payment/:paymentId'", () => {
      // Arrange
      const reportId = '1';
      const paymentId = '2';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, paymentId },
      });

      // Act
      postUnlinkPaymentFees(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
