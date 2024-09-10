import { RequestHandler } from 'express';
import { isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = (_req, res, next) => {
  // TODO: DTFS2-7348 use the correct Feature Flag here
  if (!isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(404, '/not-found');
  }

  return next();
};
