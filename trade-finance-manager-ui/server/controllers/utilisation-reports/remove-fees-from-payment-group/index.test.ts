import httpMocks from 'node-mocks-http';
import { postRemoveFeesFromPaymentGroup } from '.';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/remove-fees-from-payment', () => {
  describe('postRemoveFeesFromPaymentGroup', () => {
    const userToken = 'abc123';
    const requestSession = {
      user: aTfmSessionUser(),
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1', paymentId: '2' },
      });

      jest.mocked(api.removeFeesFromPaymentGroup).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });

    it("redirects to '/utilisation-reports/:reportId/edit-payment/:paymentId'", async () => {
      // Arrange
      const reportId = '1';
      const paymentId = '2';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, paymentId },
      });

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
