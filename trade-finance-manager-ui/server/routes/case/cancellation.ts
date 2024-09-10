import { Router } from 'express';
import { TEAM_IDS } from '@ukef/dtfs2-common';
import { getReasonForCancellation } from '../../controllers/case/cancellation/reason-for-cancellation.controller';
import { validateUserTeam } from '../../middleware';
import { validateDealCancellationEnabled } from '../../middleware/feature-flags/deal-cancellation';

export const cancellationRouter = Router();

cancellationRouter.use(validateDealCancellationEnabled, validateUserTeam([TEAM_IDS.PIM]));

cancellationRouter.get('/reason', getReasonForCancellation);
