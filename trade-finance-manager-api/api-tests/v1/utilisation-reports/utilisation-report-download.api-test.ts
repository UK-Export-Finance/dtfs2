import { initialiseTestUsers } from '../../api-test-users';
import app from '../../../src/createApp';
import { createApi } from '../../api';

const { as, get } = createApi(app);

describe('/v1/utilisation-reports/:id/download', () => {
  describe('GET /v1/utilisation-reports/:id/download', () => {
    const integerId = '12';

    const getUtilisationReportDownloadUrl = ({ id }: { id: string }) => `/v1/utilisation-reports/${id}/download`;

    it('returns a 401 response when user is not authenticated', async () => {
      // Arrange
      const url = getUtilisationReportDownloadUrl({ id: integerId });

      // Act
      const response = await get(url);

      // Assert
      expect(response.status).toEqual(401);
    });

    it('returns a 400 response when the id path param is invalid', async () => {
      // Arrange
      const testUsers = await initialiseTestUsers(app);
      const tokenUser = testUsers().one();
      const url = getUtilisationReportDownloadUrl({ id: 'invalid' });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('gets report download for an authenticated user', async () => {
      // Arrange
      const testUsers = await initialiseTestUsers(app);
      const tokenUser = testUsers().one();
      const url = getUtilisationReportDownloadUrl({ id: integerId });

      // Act
      const response = await as(tokenUser).get(url);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
