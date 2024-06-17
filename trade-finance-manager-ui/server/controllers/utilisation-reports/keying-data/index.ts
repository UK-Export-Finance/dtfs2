import { Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { CustomExpressRequest } from '../../../types/custom-express-request';

type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: {
    canGenerateKeyingData: 'true' | 'false';
  };
}>;

export const postKeyingData = async (req: PostKeyingDataRequest, res: Response) => {
  const { userToken } = asUserSession(req.session);
  const { reportId } = req.params;
  const { canGenerateKeyingData } = req.body;

  try {
    if (canGenerateKeyingData !== 'true') {
      req.session.generateKeyingDataErrorKey = 'no-matching-fee-records';
      return res.redirect(`/utilisation-reports/${reportId}`);
    }

    await api.generateKeyingData(reportId, userToken);

    return res.redirect(`/utilisation-reports/${reportId}#keying-sheet`);
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
