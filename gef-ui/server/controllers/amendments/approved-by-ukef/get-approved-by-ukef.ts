import { format, fromUnixTime } from 'date-fns';
import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, DATE_FORMATS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { ApprovedByUkefViewModel } from '../../../types/view-models/amendments/approved-by-ukef-view-model';

export type GetApprovedByUkefRequest = CustomExpressRequest<{
  params: { facilityId: string; amendmentId: string };
}>;

/**
 * controller to get approval by ukef amendment page
 *
 * @param req - The express request
 * @param res - The express response
 */
export const getApprovedByUkef = async (req: GetApprovedByUkefRequest, res: Response) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s not found for the facility facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (amendment.status !== PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED) {
      console.error(`Amendment %s on facility %s is not ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const effectiveDate = format(fromUnixTime(Number(amendment.effectiveDate)), DATE_FORMATS.D_MMMM_YYYY);

    const viewModel: ApprovedByUkefViewModel = {
      approvedByUkef: true,
      effectiveDate,
      referenceNumber: amendment.referenceNumber,
    };

    return res.render('partials/amendments/submitted-page.njk', viewModel);
  } catch (error) {
    console.error('Error getting approval by ukef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
