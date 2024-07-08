import httpMocks from 'node-mocks-http';
import { postRemoveFeesFromPayment } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

console.error = jest.fn();

jest.mock('../../../helpers/edit-payments-table-checkbox-id-helper');

describe('controllers/utilisation-reports/remove-fees-from-payment', () => {
  describe('postRemoveFeesFromPayment', () => {
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
      postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
