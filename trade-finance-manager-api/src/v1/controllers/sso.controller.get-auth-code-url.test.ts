import { aGetAuthCodeUrlRequest, aGetAuthCodeUrlResponse, GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse, TestApiError } from '@ukef/dtfs2-common';
import { resetAllWhenMocks } from 'jest-when';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { SsoController } from './sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdServiceMockBuilder, UserServiceMockBuilder } from '../__mocks__/builders';
import { UserService } from '../services/user.service';

describe('SsoController', () => {
  let ssoController: SsoController;
  let entraIdService: EntraIdService;
  let userService: UserService;
  let req: httpMocks.MockRequest<GetAuthCodeUrlApiRequest>;
  let res: httpMocks.MockResponse<GetAuthCodeUrlApiResponse>;

  console.error = jest.fn();

  const getAuthCodeUrlMock = jest.fn();

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    jest.resetAllMocks();
    entraIdService = new EntraIdServiceMockBuilder().with({ getAuthCodeUrl: getAuthCodeUrlMock }).build();
    userService = new UserServiceMockBuilder().build();
    ssoController = new SsoController({ entraIdService, userService });

    ssoController = new SsoController({ entraIdService, userService });

    ({ req, res } = getHttpMocks(aGetAuthCodeUrlRequest()));
  });

  it('should call getAuthCodeUrl with the correct params', async () => {
    await ssoController.getAuthCodeUrl(req, res);

    expect(getAuthCodeUrlMock).toHaveBeenCalledWith({ successRedirect: req.body.successRedirect });
    expect(getAuthCodeUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should return auth code URL on success', async () => {
    const getAuthCodeUrlResponse = aGetAuthCodeUrlResponse();
    getAuthCodeUrlMock.mockResolvedValue(getAuthCodeUrlResponse);

    await ssoController.getAuthCodeUrl(req, res);

    expect(res._getJSONData()).toEqual(getAuthCodeUrlResponse);
  });

  it('should return a 200 status code on success', async () => {
    const getAuthCodeUrlResponse = aGetAuthCodeUrlResponse();
    getAuthCodeUrlMock.mockResolvedValue(getAuthCodeUrlResponse);

    await ssoController.getAuthCodeUrl(req, res);

    expect(res.statusCode).toBe(HttpStatusCode.Ok);
  });

  it('should call console.error on error', async () => {
    const error = new Error('Test error');
    getAuthCodeUrlMock.mockRejectedValue(error);

    await ssoController.getAuthCodeUrl(req, res).catch(() => {});

    expect(console.error).toHaveBeenCalledWith('Failed to get auth code url', error);
  });

  it('should return an error response on api error', async () => {
    const error = new TestApiError({ status: HttpStatusCode.BadGateway, message: 'Test error' });
    getAuthCodeUrlMock.mockRejectedValue(error);

    await ssoController.getAuthCodeUrl(req, res);

    expect(res.statusCode).toBe(error.status);

    expect(res._getData()).toEqual({
      status: error.status,
      message: `Failed to get auth code url: ${error.message}`,
    });
  });

  it('should return a 500 status code on non api error', async () => {
    const error = new Error('Test error');
    getAuthCodeUrlMock.mockRejectedValue(error);

    await ssoController.getAuthCodeUrl(req, res);

    expect(res.statusCode).toBe(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Failed to get auth code url',
    });
  });

  function getHttpMocks(body: GetAuthCodeUrlApiRequest['body']): {
    req: httpMocks.MockRequest<GetAuthCodeUrlApiRequest>;
    res: httpMocks.MockResponse<GetAuthCodeUrlApiResponse>;
  } {
    return httpMocks.createMocks({
      body,
    });
  }
});
