import { HttpStatusCode } from 'axios';
import { MockResponse, createMocks } from 'node-mocks-http';
import { Response } from 'express';
import { getAccountSuspendedPage, GetTemporarilySuspendedAccessCodePageRequest } from './account-suspended-page';

describe('getAccountSuspendedPage', () => {
  let req: GetTemporarilySuspendedAccessCodePageRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mocks = createMocks<GetTemporarilySuspendedAccessCodePageRequest>({ params: {} });
    req = mocks.req as GetTemporarilySuspendedAccessCodePageRequest;
    res = mocks.res;
  });

  it('should render the temporarily suspended access code template', () => {
    // Act
    getAccountSuspendedPage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('login/temporarily-suspended-access-code.njk');
  });
});
