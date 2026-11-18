import { AuthorizationUrlRequest } from '@azure/msal-node';
import { Response } from 'express';
import zod from 'zod';
import { AuditDetails } from '@ukef/types/audit-details';
import { CustomExpressRequest } from '@ukef/types/express-custom-request';
import { ApiErrorResponseBody } from '@ukef/types/api-error-response-body';
import { HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA } from '@ukef/schemas/tfm/handle-sso-redirect-form-response.schema';
import { EntraIdAuthCodeRedirectResponseBody } from './entra-id';

export type HandleSsoRedirectFormRequest = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
  auditDetails: AuditDetails<'system'>;
};

export type HandleSsoRedirectFormResponse = zod.infer<typeof HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA>;

export type HandleSsoRedirectFormUiRequest = CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>;

export type HandleSsoRedirectFormApiRequest = CustomExpressRequest<{ reqBody: HandleSsoRedirectFormRequest }>;

export type HandleSsoRedirectFormApiResponse = Response<HandleSsoRedirectFormResponse | ApiErrorResponseBody>;
