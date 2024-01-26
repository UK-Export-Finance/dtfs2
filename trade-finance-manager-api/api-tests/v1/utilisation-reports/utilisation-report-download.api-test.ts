import testUserCache from '../../api-test-users';
import app from '../../../src/createApp';
import api from '../../api';

const { as, get } = api(app);

describe('/v1/utilisation-reports/:_id/download', () => {
  describe('GET /v1/utilisation-reports/:_id/download', () => {
    const validMongoId = '6581aa7ad727816f9301f75a';

    const getUtilisationReportDownloadUrl = ({ _id }: { _id: string }) => `/v1/utilisation-reports/${_id}/download`;

    it('returns a 401 response when user is not authenticated', async () => {
      // Arrange
      const url = getUtilisationReportDownloadUrl({ _id: validMongoId });

      // Act
      const response = await get(url);

      // Assert
      expect(response.status).toEqual(401);
    });

    it('returns a 400 response when the _id path param is invalid', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const url = getUtilisationReportDownloadUrl({ _id: 'invalid' });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('gets report download for authenticated user', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const url = getUtilisationReportDownloadUrl({ _id: validMongoId });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
