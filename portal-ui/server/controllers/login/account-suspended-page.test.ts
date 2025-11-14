import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { Response } from 'express';
import { renderTemporarilySuspendedAccessCodePage, GetTemporarilySuspendedAccessCodePageRequest } from './account-suspended-page.ts';

describe('renderTemporarilySuspendedAccessCodePage', () => {
  let req: GetTemporarilySuspendedAccessCodePageRequest;
  let res: Response & {
    _getStatusCode: () => number;
    _getRenderView: () => string;
    _getRenderData: () => any;
  };

  beforeEach(() => {
    jest.resetAllMocks();
    const mocks = createMocks<GetTemporarilySuspendedAccessCodePageRequest>({ params: {} });
    req = mocks.req as GetTemporarilySuspendedAccessCodePageRequest;
    res = mocks.res as typeof res;
  });

  it('should render the temporarily suspended access code template', () => {
    // Arrange
    const handler = renderTemporarilySuspendedAccessCodePage[1];
    const next = jest.fn();

    // Act
    handler(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('login/temporarily-suspended-access-code.njk');
    expect(next).not.toHaveBeenCalled();
  });
});
