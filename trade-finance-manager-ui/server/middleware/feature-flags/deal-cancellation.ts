import { RequestHandler } from 'express';
import { isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = (req, res, next) => {
  if (!isTfmDealCancellationFeatureFlagEnabled()) {
    console.info(`Deal cancellation feature flag disabled, accessing ${req.originalUrl}`);
    return res.redirect('/not-found');
  }

  return next();
};
