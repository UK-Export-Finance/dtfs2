import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import { EntraIdAuthCodeRedirectResponseBody } from './entra-id';
import { TfmSessionUser } from './tfm-session-user';
import { AuditDetails } from '../audit-details';
import { CustomExpressRequest } from '../express-custom-request';
import { ApiErrorResponseBody } from '../api-error-response-body';

export type HandleSsoRedirectFormRequest = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
  auditDetails: AuditDetails<'system'>;
};

export type HandleSsoRedirectFormResponse = {
  user: TfmSessionUser;
  token: string;
  expires: string;
  successRedirect?: string;
};

export type HandleSsoRedirectFormUiRequest = CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>;

export type HandleSsoRedirectFormApiRequest = CustomExpressRequest<{ reqBody: HandleSsoRedirectFormRequest }>;

export type HandleSsoRedirectFormApiResponse = Response<HandleSsoRedirectFormResponse | ApiErrorResponseBody>;
