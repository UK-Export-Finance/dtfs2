import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import { CustomExpressRequest } from '../express-custom-request';
import { ApiErrorResponseBody } from '../api-error-response-body';

export type GetAuthCodeUrlParams = {
  successRedirect: string;
};

// This is used to differentiate between the request body leaving TFM UI to TFM API,
// and the parameters that get passed around functions internal to the respective services
export type GetAuthCodeUrlRequest = GetAuthCodeUrlParams;

export type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};

export type GetAuthCodeUrlApiRequest = CustomExpressRequest<{ reqBody: GetAuthCodeUrlRequest }>;

export type GetAuthCodeUrlApiResponse = Response<GetAuthCodeUrlResponse | ApiErrorResponseBody>;
