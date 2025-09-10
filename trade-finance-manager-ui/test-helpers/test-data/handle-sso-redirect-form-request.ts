import { anAuthorisationCodeRequest, anEntraIdAuthCodeRedirectResponseBody } from "@ukef/dtfs2-common/test-helpers";
import { HandleSsoRedirectFormRequest } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';

export const aHandleSsoRedirectFormRequest = (): HandleSsoRedirectFormRequest => ({
  authCodeResponse: anEntraIdAuthCodeRedirectResponseBody(),
  originalAuthCodeUrlRequest: anAuthorisationCodeRequest(),
  auditDetails: generateSystemAuditDetails(),
});
