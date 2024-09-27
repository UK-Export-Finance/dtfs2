import { Request, Response } from 'express';
import { EntraIdService } from '../../../services/entra-id.service';

export class LoginController {
  constructor(private readonly entraIdService: EntraIdService) {
    this.entraIdService = entraIdService;
  }

  public async getLogin(req: Request, res: Response) {
    if (req.session.user) {
      // User is already logged in.
      return res.redirect('/home');
    }

    const { authCodeUrl, authCodeUrlRequest } = await this.entraIdService.getAuthCodeUrl({ successRedirect: '/' });

    // As this is the user logging in, there should be no existing login data in the session.
    // if there is, it should be cleared and set to the authCodeUrlRequest.
    req.session.loginData = { authCodeUrlRequest };
    return res.redirect(authCodeUrl);
  }

  // TODO dtfs2-6892: Update this logout handling
  public getLogout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
}
