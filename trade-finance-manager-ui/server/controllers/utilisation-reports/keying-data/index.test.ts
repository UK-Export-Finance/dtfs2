import httpMocks from 'node-mocks-http';
import { postKeyingData } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import api from '../../../api';

console.error = jest.fn();

jest.mock('../../../api');

describe('controllers/utilisation-reports/keying-data', () => {
  describe('postKeyingData', () => {
    const userToken = 'abc123';
    const user = aTfmSessionUser();
    const requestSession = {
      user,
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    beforeEach(() => {
      jest.mocked(api.generateKeyingData).mockResolvedValue({});
    });

    it('generates the keying data for the report', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
      });

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(api.generateKeyingData).toHaveBeenCalledWith(reportId, user, userToken);
    });

    it("redirects to '/utilisation-reports/:reportId#keying-sheet'", async () => {
      // Arrange
      const reportId = '12';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
      });

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toBe(true);
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1' },
      });

      jest.mocked(api.generateKeyingData).mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });
});
