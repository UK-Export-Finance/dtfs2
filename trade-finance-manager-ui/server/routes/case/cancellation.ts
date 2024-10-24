/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { TEAM_IDS } from '@ukef/dtfs2-common';
import { getReasonForCancelling, postReasonForCancelling } from '../../controllers/case/cancellation/reason-for-cancelling.controller';
import { getBankRequestDate, postBankRequestDate } from '../../controllers/case/cancellation/bank-request-date.controller';
import { validateUserTeam } from '../../middleware';
import { validateDealCancellationEnabled } from '../../middleware/feature-flags/deal-cancellation';
import { getEffectiveFromDate, postEffectiveFromDate } from '../../controllers/case/cancellation/effective-from-date.controller';
import { getCancelCancellation, postCancelCancellation } from '../../controllers/case/cancellation/cancel-cancellation.controller';
import { getDealCancellationDetails, postDealCancellationDetails } from '../../controllers/case/cancellation/check-details.controller';

export const cancellationRouter = Router();

cancellationRouter.use(validateDealCancellationEnabled, validateUserTeam([TEAM_IDS.PIM]));

cancellationRouter.get('/:_id/cancellation/reason', getReasonForCancelling);
cancellationRouter.post('/:_id/cancellation/reason', postReasonForCancelling);

cancellationRouter.get('/:_id/cancellation/bank-request-date', getBankRequestDate);
cancellationRouter.post('/:_id/cancellation/bank-request-date', postBankRequestDate);

cancellationRouter.get('/:_id/cancellation/effective-from-date', getEffectiveFromDate);
cancellationRouter.post('/:_id/cancellation/effective-from-date', postEffectiveFromDate);

cancellationRouter.get('/:_id/cancellation/cancel', getCancelCancellation);
cancellationRouter.post('/:_id/cancellation/cancel', postCancelCancellation);

cancellationRouter.get('/:_id/cancellation/check-details', getDealCancellationDetails);
cancellationRouter.post('/:_id/cancellation/check-details', postDealCancellationDetails);
