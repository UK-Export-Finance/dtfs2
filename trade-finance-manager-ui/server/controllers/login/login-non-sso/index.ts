import { Request, Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../../api';
import { validationErrorHandler } from '../../../helpers/validationErrorHandler.helper';

export const getLogin = (req: Request, res: Response) =>
  res.render('login.njk', {
    user: req.session.user,
  });

export const postLogin = async (req: CustomExpressRequest<{ reqBody: { email?: string; password?: string } }>, res: Response) => {
  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email) loginErrors.push(emailError);
  if (!password) loginErrors.push(passwordError);

  if (email && password) {
    const response = (await api.login(email, password)) as {
      success: boolean;
      token: string;
      user: TfmSessionUser;
    };

    const { success, token, user } = response;

    if (success) {
      req.session.userToken = token;
      req.session.user = user;
    } else {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);
    }
  }

  if (loginErrors.length) {
    return res.render('login.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  return res.redirect('/home');
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
