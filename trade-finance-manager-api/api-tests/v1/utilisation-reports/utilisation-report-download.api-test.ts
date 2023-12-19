import testUserCache from '../../api-test-users';
import app from '../../../src/createApp';
import api from '../../api';

const { as, get } = api(app);

describe('/v1/banks/:bankId/utilisation-report-download/:_id', () => {
  describe('GET /v1/banks/:bankId/utilisation-report-download/:_id', () => {
    const validBankId = '789';
    const validMongoId = '6581aa7ad727816f9301f75a';

    const getUtilisationReportDownloadUrl = ({ bankId, _id }: { bankId: string; _id: string }) => `/v1/banks/${bankId}/utilisation-report-download/${_id}`;

    it('returns a 401 response when user is not authenticated', async () => {
      // Arrange
      const url = getUtilisationReportDownloadUrl({ bankId: validBankId, _id: validMongoId });

      // Act
      const response = await get(url);

      // Assert
      expect(response.status).toEqual(401);
    });

    it('returns a 400 response when the bankId path param is invalid', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const bankId = 'invalid';
      const url = getUtilisationReportDownloadUrl({ bankId, _id: validMongoId });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('returns a 400 response when the _id path param is invalid', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const _id = 'invalid';
      const url = getUtilisationReportDownloadUrl({ bankId: validBankId, _id });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('gets bank holidays for authenticated user', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const url = getUtilisationReportDownloadUrl({ bankId: validBankId, _id: validMongoId });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
