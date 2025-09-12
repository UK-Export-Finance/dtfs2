import { HttpStatusCode } from 'axios';
import { Response } from '@ukef/dtfs2-common/test-helpers';
import { api } from '../../api';
import { app } from '../../../server/createApp';

const { get } = api(app);
const url = '/countries';

describe('middleware/maintenance', () => {
  it(`should return ${HttpStatusCode.Ok} on GET countries, when the maintenance mode is deactivated`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'false';

    // Act
    const response: Response = await get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body).toMatchObject({ count: 228 });
  });

  it(`should return ${HttpStatusCode.ServiceUnavailable} on GET countries, when the maintenance mode is active`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'true';

    // Act
    const response: Response = await get(url);

    // Assert
    expect(response.status).toBe(HttpStatusCode.ServiceUnavailable);
    expect(response.body).toEqual({ message: 'The service is currently under maintenance. Please try again after 3600 seconds.' });
  });
});
