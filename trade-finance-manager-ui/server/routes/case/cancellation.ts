import { Router } from 'express';
import { TEAM_IDS } from '@ukef/dtfs2-common';
import { getReasonForCancelling, postReasonForCancelling } from '../../controllers/case/cancellation/reason-for-cancelling.controller';
import { getBankRequestDate } from '../../controllers/case/cancellation/bank-request-date.controller';
import { validateUserTeam } from '../../middleware';
import { validateDealCancellationEnabled } from '../../middleware/feature-flags/deal-cancellation';
import { getEffectiveFromDate } from '../../controllers/case/cancellation/effective-from-date.controller';

export const cancellationRouter = Router();

cancellationRouter.use(validateDealCancellationEnabled, validateUserTeam([TEAM_IDS.PIM]));

cancellationRouter.get('/:_id/cancellation/reason', getReasonForCancelling);
cancellationRouter.post('/:_id/cancellation/reason', postReasonForCancelling);

cancellationRouter.get('/:_id/cancellation/bank-request-date', getBankRequestDate);

cancellationRouter.get('/:_id/cancellation/effective-from-date', getEffectiveFromDate);
