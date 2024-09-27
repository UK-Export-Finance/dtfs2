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

    // test this
    req.session.loginData ??= { authCodeUrlRequest };
    return res.redirect(authCodeUrl);
  }

  // TODO dtfs2-6892: Update this logout handling
  public getLogout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
}
