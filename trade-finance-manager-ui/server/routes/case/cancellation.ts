import { Router } from 'express';
import { TEAM_IDS, validateDealCancellationEnabled } from '@ukef/dtfs2-common';
import { getReasonForCancelling } from '../../controllers/case/cancellation/reason-for-cancelling.controller';
import { validateUserTeam } from '../../middleware';

export const cancellationRouter = Router();

cancellationRouter.use(validateDealCancellationEnabled, validateUserTeam([TEAM_IDS.PIM]));

cancellationRouter.get('/reason', getReasonForCancelling);
