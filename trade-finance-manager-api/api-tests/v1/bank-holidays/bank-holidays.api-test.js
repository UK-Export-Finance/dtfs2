const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { createApi } = require('../../api');

const { as } = createApi(app);

describe('/v1/bank-holidays', () => {
  describe('GET /v1/bank-holidays', () => {
    it('gets bank holidays for authenticated user', async () => {
      // Arrange
      const user = await testUserCache.initialise(app);

      // Act
      const { status, body } = await as(user).get('/v1/bank-holidays');

      // Assert
      expect(status).toEqual(200);
      expect(body).not.toBeNull();
    });
  });
});
