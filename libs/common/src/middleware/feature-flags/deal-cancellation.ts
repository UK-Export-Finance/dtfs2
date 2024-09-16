import { RequestHandler } from 'express';
import { isTfmDealCancellationFeatureFlagEnabled } from '../../helpers';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = (_req, res, next) => {
  if (!isTfmDealCancellationFeatureFlagEnabled()) {
    return res.sendStatus(404);
  }

  return next();
};
