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

    it('renders the problem-with-service page when an error occurs', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1', paymentId: '2' },
      });

      // TODO - FN-1719 PR 2: Modify this to mock reject the API call instead, once implemented.
      jest.mocked(getEditPremiumPaymentsCheckboxIdsFromObjectKeys).mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      postUnlinkPaymentFees(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
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
