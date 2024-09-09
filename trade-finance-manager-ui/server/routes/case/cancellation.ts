import { Router } from 'express';
import { getReasonForCancellation } from '../../controllers/case/cancellation/reason-for-cancellation.controller';

export const cancellationRouter = Router();

cancellationRouter.route('/reason').get(getReasonForCancellation);
