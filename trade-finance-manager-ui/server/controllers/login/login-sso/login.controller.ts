import { NextFunction, Request, Response } from 'express';
import { LoginService } from '../../../services/login.service';

export class LoginController {
  private readonly loginService: LoginService;

  constructor({ loginService }: { loginService: LoginService }) {
    this.loginService = loginService;
  }

  public async getLogin(req: Request, res: Response, next: NextFunction) {
    try {
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

  // TODO DTFS2-6892: Update this logout handling
  public getLogout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
}
