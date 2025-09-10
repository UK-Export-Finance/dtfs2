import { Response } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { DEAL_TYPE, DEAL_STATUS } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';

const url = '/v1/portal/gef/deals';
const deal = {
  dealType: DEAL_TYPE.GEF,
  status: DEAL_STATUS.DRAFT,
};

describe('middleware/maintenance', () => {
  it(`should return ${HttpStatusCode.Ok} on deal submission, when the maintenance mode is deactivated`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'false';

    // Act
    const postResponse: Response = await testApi.post(deal).to(url);

    const getResponse = await testApi.get(`${url}/${postResponse.body._id}`);

    // Assert
    expect(postResponse.status).toBe(HttpStatusCode.Ok);
    expect(getResponse.status).toBe(HttpStatusCode.Ok);
    expect(getResponse.body).toEqual({
      _id: postResponse.body._id,
      ...deal,
    });
  });

  it(`should return ${HttpStatusCode.ServiceUnavailable} on deal submission, when the maintenance mode is active`, async () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'true';

    // Act
    const postResponse: Response = await testApi.post(deal).to(url);

    // Assert
    expect(postResponse.status).toBe(HttpStatusCode.ServiceUnavailable);
    expect(postResponse.body).toEqual({ message: 'The service is currently under maintenance. Please try again after 3600 seconds.' });
  });
});
