import app from '../../../src/createApp';
import testUserCache from '../../api-test-users';
import createApi from '../../api';

const { as } = createApi(app);

describe('/v1/banks', () => {
  describe('GET /v1/banks', () => {
    it('gets banks for authenticated user', async () => {
      // Arrange
      const user = await testUserCache.initialise(app);

      // Act
      const response = await as(user).get('/v1/banks');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
