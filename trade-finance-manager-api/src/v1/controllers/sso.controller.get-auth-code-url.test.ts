import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import {
  anAuthorisationCodeRequest,
  GetAuthCodeUrlApiRequest,
  GetAuthCodeUrlApiResponse,
  GetAuthCodeUrlParams,
  GetAuthCodeUrlResponse,
  withApiErrorTests,
} from '@ukef/dtfs2-common';
import { EntraIdServiceMockBuilder, UserServiceMockBuilder } from '../__mocks__/builders';
import { EntraIdService } from '../services/entra-id.service';
import { UserService } from '../services/user.service';
import { SsoController } from './sso.controller';

describe('SsoController', () => {
  describe('getAuthCodeUrl', () => {
    let entraIdService: EntraIdService;
    let userService: UserService;
    let ssoController: SsoController;
    let req: MockRequest<GetAuthCodeUrlApiRequest>;
    let res: MockResponse<GetAuthCodeUrlApiResponse>;

    const getAuthCodeUrlMock = jest.fn();

    const aSuccessRedirect = 'a-success-redirect';

    const getHttpMocks = () =>
      httpMocks.createMocks<GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse>({
        params: { successRedirect: aSuccessRedirect } as GetAuthCodeUrlParams,
      });

    beforeEach(() => {
      jest.resetAllMocks();
      entraIdService = new EntraIdServiceMockBuilder().withDefaults().with({ getAuthCodeUrl: getAuthCodeUrlMock }).build();
      userService = new UserServiceMockBuilder().withDefaults().build();
      ssoController = new SsoController({ entraIdService, userService });

      ({ req, res } = getHttpMocks());
    });

    withApiErrorTests({
      makeRequest: async () => ssoController.getAuthCodeUrl(req, res),
      mockAnError: (error: unknown) => getAuthCodeUrlMock.mockRejectedValue(error),
      getRes: () => res,
      endpointErrorMessage: 'Failed to get auth code url',
    });

    describe('when getAuthCodeUrl is successful', () => {
      it('should call entraIdService.getAuthCodeUrl with the correct params', async () => {
        // Arrange
        const expectedGetAuthCodeUrlParams: GetAuthCodeUrlParams = {
          successRedirect: aSuccessRedirect,
        };
        // Act
        await ssoController.getAuthCodeUrl(req, res);

        // Assert
        expect(getAuthCodeUrlMock).toHaveBeenCalledWith(expectedGetAuthCodeUrlParams);
      });

      it('should return the result of entraIdService.getAuthCodeUrl', async () => {
        // Arrange
        const expectedGetAuthCodeUrlResult: GetAuthCodeUrlResponse = { authCodeUrl: 'a-auth-code-url', authCodeUrlRequest: anAuthorisationCodeRequest() };
        getAuthCodeUrlMock.mockResolvedValue(expectedGetAuthCodeUrlResult);
        // Act
        await ssoController.getAuthCodeUrl(req, res);

        // Assert
        expect(res._getJSONData()).toEqual(expectedGetAuthCodeUrlResult);
        expect(res._getStatusCode()).toEqual(200);
      });

      it('should return a 200', async () => {
        // Act
        await ssoController.getAuthCodeUrl(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(200);
      });
    });
  });
});
