import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import z from 'zod';
import { EntraIdAuthCodeRedirectResponseBody } from './entra-id';
import { AuditDetails } from '../audit-details';
import { CustomExpressRequest } from '../express-custom-request';
import { ApiErrorResponseBody } from '../api-error-response-body';
import { HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA } from '../../schemas/tfm/handle-sso-redirect-form-response.schema';

export type HandleSsoRedirectFormRequest = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
  auditDetails: AuditDetails<'system'>;
};

export type HandleSsoRedirectFormResponse = z.infer<typeof HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA>;

export type HandleSsoRedirectFormUiRequest = CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>;

export type HandleSsoRedirectFormApiRequest = CustomExpressRequest<{ reqBody: HandleSsoRedirectFormRequest }>;

export type HandleSsoRedirectFormApiResponse = Response<HandleSsoRedirectFormResponse | ApiErrorResponseBody>;
