const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/bank-holidays', () => {
  describe('GET /v1/bank-holidays', () => {
    it('gets bank holidays for authenticated user', async () => {
      // Arrange
      const user = await testUserCache.initialise();

      // Act
      const { status, body } = await as(user).get('/v1/bank-holidays');

      // Assert
      expect(status).toEqual(200);
      expect(body).not.toBeNull();
    });
  });
});
