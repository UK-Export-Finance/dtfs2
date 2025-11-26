import { HttpStatusCode } from 'axios';
import { MockResponse, createMocks } from 'node-mocks-http';
import { Response } from 'express';
import { ATTEMPTS_LEFT, AttemptsLeft, PartiallyLoggedInPortalSessionData } from '@ukef/dtfs2-common';
import { getAccessCodeExpiredPage, GetAccessCodeExpiredPageRequest } from './access-code-expired-page';

describe('getAccessCodeExpiredPage', () => {
  let req: GetAccessCodeExpiredPageRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mocks = createMocks<GetAccessCodeExpiredPageRequest>({
      session: {
        numberOfSignInLinkAttemptsRemaining: 3,
      },
    });
    req = mocks.req as GetAccessCodeExpiredPageRequest;
    res = mocks.res;
  });

  it('should render the access code expired template', () => {
    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('login/access-code-expired.njk');
  });

  it('should pass attemptsRemaining to the template', () => {
    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsRemaining: AttemptsLeft };
    expect(renderData).toEqual({
      attemptsRemaining: ATTEMPTS_LEFT.THREE,
    });
  });

  it('should convert numberOfSignInLinkAttemptsRemaining from session to AttemptsLeft string', () => {
    // Arrange
    const session = req.session as unknown as PartiallyLoggedInPortalSessionData;
    session.numberOfSignInLinkAttemptsRemaining = 2;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsRemaining: AttemptsLeft };
    expect(renderData.attemptsRemaining).toEqual(ATTEMPTS_LEFT.TWO);
  });

  it('should handle 1 attempt remaining', () => {
    // Arrange
    const session = req.session as unknown as PartiallyLoggedInPortalSessionData;
    session.numberOfSignInLinkAttemptsRemaining = 1;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsRemaining: AttemptsLeft };
    expect(renderData.attemptsRemaining).toEqual(ATTEMPTS_LEFT.ONE);
  });
});
