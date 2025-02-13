import { Response } from 'express';
import { CustomExpressRequest, EntraIdAuthCodeRedirectResponseBody, InvalidPayloadError } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from '@ukef/dtfs2-common/schemas';

export class UnauthenticatedAuthController {
  /**
   *
   * @param req
   * @param res
   * @returns
   * This function handles the SSO redirect from entra, and renders the accept-sso-redirect.njk view
   * This form is then automatically submitted.
   * @see {@link tfm-sso.md} for more information
   */
  postSsoRedirect(req: CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>, res: Response) {
    if (!isVerifiedPayload({ payload: req.body, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
      throw new InvalidPayloadError('Invalid payload from SSO redirect');
    }

    const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;

    return res.render('auth/accept-sso-redirect.njk', { code, clientInfo, state, sessionState });
  }
}
