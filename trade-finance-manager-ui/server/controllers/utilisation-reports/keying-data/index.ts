import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';

export const postKeyingData = async (req: Request, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    await api.generateKeyingData(reportId, user, userToken);

    return res.redirect(`/utilisation-reports/${reportId}#keying-sheet`);
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
