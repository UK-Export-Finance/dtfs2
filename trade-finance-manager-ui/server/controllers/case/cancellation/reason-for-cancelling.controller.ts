import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { asUserSession } from '../../../helpers/express-session';
import { ReasonForCancellingViewModel } from '../../../types/view-models';

/**
 * controller to get the reason for cancelling page
 */
export const getReasonForCancelling = (req: CustomExpressRequest<{ params: { dealId: string } }>, res: Response) => {
  const { dealId } = req.params;
  const { user } = asUserSession(req.session);

  const reasonForCancellingViewModel: ReasonForCancellingViewModel = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
    user,
    ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
    dealId, // TODO: DTFS2-7350 get values from database
  };
  return res.render('case/cancellation/reason-for-cancelling.njk', reasonForCancellingViewModel);
};
