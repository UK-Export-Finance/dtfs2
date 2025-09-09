import { HttpStatusCode } from 'axios';
import { Response } from '@ukef/dtfs2-common/test-helpers';
import api from '../../api';
import app from '../../../server/createApp';
import testUserCache from '../../api-test-users';
import { TestUser } from '../../types/test-user';
import { MAKER } from '../../../server/v1/roles/roles';

const { as } = api(app);
const url = '/v1/mandatory-criteria';

describe('middleware/maintenance', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let testMaker: TestUser;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testMaker = testUsers().withRole(MAKER).one() as TestUser;
  });

  it(`should return ${HttpStatusCode.Ok} on GET mandatory criteria, when the maintenance mode is deactivated`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'false';

    // Act
    const response: Response = await as(testMaker).get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body).toMatchObject({ count: 5 });
  });

  it(`should return ${HttpStatusCode.ServiceUnavailable} on GET mandatory criteria, when the maintenance mode is active`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'true';

    // Act
    const response: Response = await as(testMaker).get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.ServiceUnavailable);
    expect(response.body).toEqual({ message: 'The service is currently under maintenance. Please try again after 3600 seconds.' });
  });
});
