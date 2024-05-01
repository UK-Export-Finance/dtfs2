const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/utilisation-reports/banks', () => {
  describe('GET /v1/utilisation-reports/banks', () => {
    it('gets banks for authenticated user', async () => {
      // Arrange
      const user = await testUserCache.initialise(app);

      // Act
      const { status, body } = await as(user).get('/v1/banks');

      // Assert
      expect(status).toEqual(200);
      expect(body).not.toBeNull();
    });
  });
});
