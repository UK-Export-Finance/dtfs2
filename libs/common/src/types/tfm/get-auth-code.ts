import z from 'zod';
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import { CustomExpressRequest } from '../express-custom-request';
import { ApiErrorResponseBody } from '../api-error-response-body';
import { GET_AUTH_CODE_PARAMS_SCHEMA, GET_AUTH_CODE_REQUEST_SCHEMA } from '../../schemas';

export type GetAuthCodeUrlParams = z.infer<typeof GET_AUTH_CODE_PARAMS_SCHEMA>;

export type GetAuthCodeUrlRequest = z.infer<typeof GET_AUTH_CODE_REQUEST_SCHEMA>;

export type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};

export type GetAuthCodeUrlApiRequest = CustomExpressRequest<{ reqBody: GetAuthCodeUrlRequest }>;

export type GetAuthCodeUrlApiResponse = Response<GetAuthCodeUrlResponse | ApiErrorResponseBody>;
