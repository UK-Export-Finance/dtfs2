import { PENDING_RECONCILIATION, REPORT_NOT_RECEIVED } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import { createApi } from '../../api';
import { initialiseTestUsers } from '../../api-test-users';
import { TestUser } from '../../types/test-user';

const { as } = createApi(app);

describe('/v1/utilisation-reports/set-status', () => {
  const url = '/v1/utilisation-reports/set-status';
  let tokenUser: TestUser;

  beforeEach(async () => {
    const testUsers = await initialiseTestUsers(app);
    tokenUser = testUsers().one();
  });

  it('should return a 400 status code if the body does not contain the expected payload', async () => {
    // Arrange
    const payload = {};

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('should return a 400 status code if the body does not contain a user object', async () => {
    // Arrange
    const payload = {
      reportsWithStatus: [],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('should return a 400 status code if reportsWithStatus is not an array', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: {},
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('should return a 400 status code if reportsWithStatus array is empty', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: [],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('should return a 400 status code if the reportsWithStatus array does not match the expected format', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: [
        {
          status: REPORT_NOT_RECEIVED,
        },
      ],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(400);
  });

  it('should return a 204 if the payload has the correct format', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: [
        {
          status: PENDING_RECONCILIATION,
          reportId: '1',
        },
      ],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toEqual(204);
  });
});
