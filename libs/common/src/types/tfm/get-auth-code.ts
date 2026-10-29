import zod from 'zod';
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/types/express-custom-request';
import { ApiErrorResponseBody } from '@ukef/types/api-error-response-body';
import { GET_AUTH_CODE_PARAMS_SCHEMA, GET_AUTH_CODE_REQUEST_SCHEMA } from '@ukef/schemas';

export type GetAuthCodeUrlParams = zod.infer<typeof GET_AUTH_CODE_PARAMS_SCHEMA>;

export type GetAuthCodeUrlRequest = zod.infer<typeof GET_AUTH_CODE_REQUEST_SCHEMA>;

export type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};

export type GetAuthCodeUrlApiRequest = CustomExpressRequest<{ reqBody: GetAuthCodeUrlRequest }>;

export type GetAuthCodeUrlApiResponse = Response<GetAuthCodeUrlResponse | ApiErrorResponseBody>;
