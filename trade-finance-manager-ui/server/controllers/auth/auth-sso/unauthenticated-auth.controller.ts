import { Response } from 'express';
import { CustomExpressRequest, InvalidPayloadError } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { EntraIdAuthCodeRedirectResponseBody } from '../../../types/entra-id';
import { EntraIdAuthCodeRedirectResponseBodySchema } from '../../../schemas';

export class UnauthenticatedAuthController {
  postSsoRedirect(req: CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>, res: Response) {
    if (!isVerifiedPayload({ payload: req.body, template: EntraIdAuthCodeRedirectResponseBodySchema })) {
      throw new InvalidPayloadError('Invalid payload from SSO redirect');
    }

    const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;

    return res.render('sso/accept-sso-redirect.njk', { code, clientInfo, state, sessionState });
  }
}
