import { RequestHandler } from 'express';
import { isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = (_req, res, next) => {
  if (!isTfmDealCancellationFeatureFlagEnabled()) {
    return res.redirect(404, '/not-found');
  }

  return next();
};
