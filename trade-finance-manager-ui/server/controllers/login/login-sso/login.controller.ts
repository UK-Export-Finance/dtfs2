import { Request, Response } from 'express';
import { HandleSsoRedirectFormUiRequest, InvalidPayloadError } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { asPartiallyLoggedInUserSession } from '../../../helpers/express-session';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';

export class LoginController {
  private readonly loginService: LoginService;
  private readonly userSessionService: UserSessionService;

  constructor({ loginService, userSessionService }: { loginService: LoginService; userSessionService: UserSessionService }) {
    this.loginService = loginService;
    this.userSessionService = userSessionService;
  }

  public async getLogin(req: Request, res: Response) {
    try {
      // TODO: This validation is legacy code, and can be improved
      if (req.session.user) {
        // User is already logged in.
        return res.redirect('/home');
      }

      const { authCodeUrl, authCodeUrlRequest } = await this.loginService.getAuthCodeUrl({ successRedirect: '/' });

      this.userSessionService.createPartiallyLoggedInSession({ session: req.session, authCodeUrlRequest });

      return res.redirect(authCodeUrl);
    } catch (error) {
      console.error('Unable to log in user: %O', error);
      return res.render('_partials/problem-with-service.njk');
    }
  }

  async handleSsoRedirectForm(req: HandleSsoRedirectFormUiRequest, res: Response) {
    try {
      const { body, session } = req;
      const partiallyLoggedInSession = asPartiallyLoggedInUserSession(session);
      const auditDetails = generateSystemAuditDetails();

      if (!isVerifiedPayload({ payload: body, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
        throw new InvalidPayloadError('Invalid payload from SSO redirect');
      }

      const { successRedirect, user, token } = await this.loginService.handleSsoRedirectForm({
        authCodeResponse: body,
        originalAuthCodeUrlRequest: partiallyLoggedInSession.loginData.authCodeUrlRequest,
        auditDetails,
      });

      this.userSessionService.createLoggedInSession({ session, user, userToken: token });

      return res.redirect(successRedirect ?? '/');
    } catch (error) {
      console.error('Unable to redirect user after login: %O', error);
      return res.render('_partials/problem-with-service.njk');
    }
  }

  // TODO DTFS2-6892: Update this logout handling
  public getLogout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
}
