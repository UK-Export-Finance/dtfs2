import { NextFunction, Request, Response } from 'express';
import { HandleSsoRedirectFormUiRequest, InvalidPayloadError } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { asPartiallyLoggedInUserSession } from '../../../helpers/express-session';
import { LoginService } from '../../../services/login.service';

export class LoginController {
  private readonly loginService: LoginService;

  constructor({ loginService }: { loginService: LoginService }) {
    this.loginService = loginService;
  }

  public async getLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: This validation is legacy code, and can be improved
      if (req.session.user) {
        // User is already logged in.
        return res.redirect('/home');
      }

      const { authCodeUrl, authCodeUrlRequest } = await this.loginService.getAuthCodeUrl({ successRedirect: '/' });

      // As this is the user logging in, there should be no existing login data in the session.
      // if there is, it should be cleared and set to the authCodeUrlRequest.
      req.session.loginData = { authCodeUrlRequest };

      return res.redirect(authCodeUrl);
    } catch (error) {
      return next(error);
    }
  }

  async handleSsoRedirectForm(req: HandleSsoRedirectFormUiRequest, res: Response, next: NextFunction) {
    try {
      const { body, session: partiallyLoggedInSession } = req;
      const session = asPartiallyLoggedInUserSession(partiallyLoggedInSession);
      const auditDetails = generateSystemAuditDetails();

      if (!isVerifiedPayload({ payload: body, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
        throw new InvalidPayloadError('Invalid payload from SSO redirect');
      }

      const { successRedirect } = await this.loginService.handleSsoRedirectFormAndCreateToken({
        authCodeResponse: body,
        originalAuthCodeUrlRequest: session.loginData.authCodeUrlRequest,
        session,
        auditDetails,
      });

      return res.redirect(successRedirect ?? '/');
    } catch (error) {
      return next(error);
    }
  }

  // TODO DTFS2-6892: Update this logout handling
  public getLogout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
}
