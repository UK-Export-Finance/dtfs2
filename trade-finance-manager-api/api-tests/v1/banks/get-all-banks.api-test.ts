import { Response } from 'supertest';
import { Bank } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import { initialiseTestUsers } from '../../api-test-users';
import { createApi } from '../../api';

const { as } = createApi(app);

interface CustomResponse extends Response {
  body: Bank[];
}

describe('/v1/banks', () => {
  describe('GET /v1/banks', () => {
    it('gets banks for authenticated user', async () => {
      // Arrange
      const testUsers = await initialiseTestUsers(app);
      const user = testUsers().one();

      // Act
      const response: CustomResponse = await as(user).get('/v1/banks');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
