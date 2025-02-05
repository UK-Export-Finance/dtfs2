import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import { CustomExpressRequest } from '../express-custom-request';

export type GetAuthCodeUrlParams = {
  successRedirect: string;
};

export type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};

export type GetAuthCodeUrlApiRequest = CustomExpressRequest<{ params: GetAuthCodeUrlParams }>;

export type GetAuthCodeUrlApiResponse = Response<GetAuthCodeUrlResponse>;
