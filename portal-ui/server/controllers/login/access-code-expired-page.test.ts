import { HttpStatusCode } from 'axios';
import { MockResponse, createMocks } from 'node-mocks-http';
import { Response } from 'express';
import { getAccessCodeExpiredPage, GetAccessCodeExpiredPageRequest } from './access-code-expired-page';

describe('getAccessCodeExpiredPage', () => {
  let req: GetAccessCodeExpiredPageRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mocks = createMocks<GetAccessCodeExpiredPageRequest>({
      session: {
        numberOfSendSignInLinkAttemptsRemaining: 3,
      },
    });
    req = mocks.req;
    res = mocks.res;
  });

  it('should render the access code expired template', () => {
    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('login/access-code-expired.njk');
  });

  it('should pass attemptsLeft to the template', () => {
    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsLeft: number };
    expect(renderData).toEqual({
      attemptsLeft: 3,
    });
  });

  it('should pass correct attemptsLeft value for 2 attempts', () => {
    // Arrange
    req.session.numberOfSendSignInLinkAttemptsRemaining = 2;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsLeft: number };
    expect(renderData.attemptsLeft).toEqual(2);
  });

  it('should handle 1 attempt remaining', () => {
    // Arrange
    req.session.numberOfSendSignInLinkAttemptsRemaining = 1;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    const renderData = res._getRenderData() as { attemptsLeft: number };
    expect(renderData.attemptsLeft).toEqual(1);
  });

  it('should render problem with service when numberOfSendSignInLinkAttemptsRemaining is not a number', () => {
    // Arrange
    req.session.numberOfSendSignInLinkAttemptsRemaining = undefined;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
  });

  it('should render problem with service when numberOfSendSignInLinkAttemptsRemaining is greater than 3', () => {
    // Arrange
    req.session.numberOfSendSignInLinkAttemptsRemaining = 5;

    // Act
    getAccessCodeExpiredPage(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
  });
});
