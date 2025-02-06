import { aGetAuthCodeUrlParams, aGetAuthCodeUrlResponse, GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse } from '@ukef/dtfs2-common';
import { resetAllWhenMocks } from 'jest-when';
import httpMocks from 'node-mocks-http';
import { SsoController } from './sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdServiceMockBuilder } from '../__mocks__/builders';

describe('SsoController', () => {
  let ssoController: SsoController;
  let entraIdService: EntraIdService;

  console.error = jest.fn();

  const getAuthCodeUrlMock = jest.fn();

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();

    entraIdService = new EntraIdServiceMockBuilder()
      .with({
        getAuthCodeUrl: getAuthCodeUrlMock,
      })
      .build();

    ssoController = new SsoController({ entraIdService });
  });

  it('should call getAuthCodeUrl with the correct params', async () => {
    const getAuthCodeUrlParmas = aGetAuthCodeUrlParams();
    const { req, res } = getHttpMocks(getAuthCodeUrlParmas);

    await ssoController.getAuthCodeUrl(req, res);

    expect(getAuthCodeUrlMock).toHaveBeenCalledWith(getAuthCodeUrlParmas);
    expect(getAuthCodeUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should return auth code URL on success', async () => {
    const { req, res } = getHttpMocks(aGetAuthCodeUrlParams());

    const getAuthCodeUrlResponse = aGetAuthCodeUrlResponse();
    getAuthCodeUrlMock.mockResolvedValue(getAuthCodeUrlResponse);

    await ssoController.getAuthCodeUrl(req, res);

    expect(res._getJSONData()).toEqual(getAuthCodeUrlResponse);
  });

  it('should pass through thrown errors', async () => {
    const getAuthCodeUrlParmas = aGetAuthCodeUrlParams();
    const { req, res } = getHttpMocks(getAuthCodeUrlParmas);

    const error = new Error('Test error');
    getAuthCodeUrlMock.mockRejectedValue(error);

    await expect(ssoController.getAuthCodeUrl(req, res)).rejects.toThrow(error);
  });

  it('should call console.error on error', async () => {
    const getAuthCodeUrlParmas = aGetAuthCodeUrlParams();
    const { req, res } = getHttpMocks(getAuthCodeUrlParmas);

    const error = new Error('Test error');
    getAuthCodeUrlMock.mockRejectedValue(error);

    await ssoController.getAuthCodeUrl(req, res).catch(() => {});

    expect(console.error).toHaveBeenCalledWith('An error occurred while getting the auth code URL:', error);
  });

  function getHttpMocks(params: GetAuthCodeUrlApiRequest['params']): {
    req: httpMocks.MockRequest<GetAuthCodeUrlApiRequest>;
    res: httpMocks.MockResponse<GetAuthCodeUrlApiResponse>;
  } {
    return httpMocks.createMocks({
      params,
    });
  }
});
