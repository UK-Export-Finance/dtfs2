import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';

export type GetAmendmentConfirmationPageRequest = CustomExpressRequest<{
  params: { dealId: string };
}>;

/**
 * controller to get the submit to ukef confirmation page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getAmendmentConfirmationPage = async (req: GetAmendmentConfirmationPageRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });

    if (!deal) {
      console.error('Deal %s was not found', dealId);
      return res.redirect('/not-found');
    }

    return res.render('partials/submit-to-ukef.njk', {
      dealId,
    });
  } catch (error) {
    console.error('Error getting for submit amendment to ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
