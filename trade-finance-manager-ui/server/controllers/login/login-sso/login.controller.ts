import { Request, Response } from 'express';
import { HandleSsoRedirectFormUiRequest, InvalidPayloadError } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { asPartiallyLoggedInUserSession } from '../../../helpers/express-session';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';

export class LoginController {
  /**
   * Handles the login process for the user.
   *
   * This method checks if the user is already logged in by inspecting the session.
   * If the user is logged in, they are redirected to the '/deals' page.
   * If the user is not logged in, it retrieves the authentication code URL and
   * creates a partially logged-in session before redirecting the user to the authentication URL.
   *
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns - A promise that resolves when the login process is complete.
   */
  public static getLogin = async (req: Request, res: Response) => {
    try {
      // TODO: This validation is legacy code, and can be improved
      if (req.session.user) {
        // User is already logged in.
        return res.redirect('/home');
      }

      const { authCodeUrl, authCodeUrlRequest } = await LoginService.getAuthCodeUrl({ successRedirect: req.originalUrl });

      UserSessionService.createPartiallyLoggedInSession({ session: req.session, authCodeUrlRequest });

      return res.redirect(authCodeUrl);
    } catch (error) {
      console.error('Unable to log in user %o', error);
      return res.render('_partials/problem-with-service.njk');
    }
  };

  /**
   * Handles the SSO redirect form submission.
   *
   * This method processes the SSO redirect form, verifies the payload, and logs in the user.
   * If the payload is invalid, it throws an `InvalidPayloadError`.
   * On successful login, it redirects the user to the specified URL or the home page.
   * In case of an error, it logs the error and renders a problem with service page.
   *
   * @param req - The request object containing the form data and session.
   * @param res - The response object used to redirect or render a page.
   * @returns - A promise that resolves when the operation is complete.
   */
  public static handleSsoRedirectForm = async (req: HandleSsoRedirectFormUiRequest, res: Response) => {
    try {
      const { body, session } = req;
      const partiallyLoggedInSession = asPartiallyLoggedInUserSession(session);
      const auditDetails = generateSystemAuditDetails();

      if (!isVerifiedPayload({ payload: body, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
        throw new InvalidPayloadError('Invalid payload from SSO redirect');
      }

      const { successRedirect, user, token } = await LoginService.handleSsoRedirectForm({
        authCodeResponse: body,
        originalAuthCodeUrlRequest: partiallyLoggedInSession.loginData.authCodeUrlRequest,
        auditDetails,
      });

      UserSessionService.createLoggedInSession({ session, user, userToken: token });

      const url = successRedirect ?? '/';
      return res.redirect(url);
    } catch (error) {
      console.error('Unable to redirect the user after login %o', error);
      return res.render('_partials/problem-with-service.njk');
    }
  };

  /**
   * Handles the logout process for the user.
   *
   * This method logs out the user from the Trade Finance Manager (TFM) application.
   * It destroys the user's session and redirects them to a page they won't
   * automattically be re-logged-in from.
   *
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   */
  public static getLogout = (req: Request, res: Response) => {
    console.info('User has been logged out from TFM');
    req.session.destroy(() => {
      res.render('user-logged-out.njk');
    });
  };
}
