import { HttpStatusCode } from 'axios';
import { createApi } from '../../api';
import { Response } from '../../types/response';
import { TestUser } from '../../types/test-user';
import app from '../../../src/createApp';
import { initialiseTestUsers } from '../../api-test-users';

const { as } = createApi(app);
const url = '/v1/banks';

describe('middleware/maintenance', () => {
  let testUsers;
  let user: TestUser;

  beforeAll(async () => {
    testUsers = await initialiseTestUsers(app);
    user = testUsers().one();
  });

  it(`should return ${HttpStatusCode.Ok} on GET banks, when the maintenance mode is deactivated`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'false';

    // Act
    const response: Response = await as(user).get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body).toMatchObject([]);
  });

  it(`should return ${HttpStatusCode.ServiceUnavailable} on GET banks, when the maintenance mode is active`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'true';

    // Act
    const response: Response = await as(user).get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.ServiceUnavailable);
    expect(response.body).toEqual({ message: 'The service is currently under maintenance. Please try again after 3600 seconds.' });
  });
});
