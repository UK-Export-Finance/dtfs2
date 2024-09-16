const app = require('../../../src/createApp');
const { initialiseTestUsers } = require('../../api-test-users');
const { createApi } = require('../../api');

const { as } = createApi(app);

describe('/v1/bank-holidays', () => {
  describe('GET /v1/bank-holidays', () => {
    it('gets bank holidays for authenticated user', async () => {
      // Arrange
      const user = await initialiseTestUsers(app);

      // Act
      const { status, body } = await as(user).get('/v1/bank-holidays');

      // Assert
      expect(status).toEqual(200);
      expect(body).not.toBeNull();
    });
  });
});
