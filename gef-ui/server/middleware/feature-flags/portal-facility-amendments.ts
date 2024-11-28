import { RequestHandler } from 'express';
import { isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the portal facility amendments feature flag is enabled
 */
export const validatePortalFacilityAmendmentsEnabled: RequestHandler = (req, res, next) => {
  if (!isPortalFacilityAmendmentsFeatureFlagEnabled()) {
    console.info(`Portal facility amendments feature flag disabled, accessing ${req.originalUrl}`);
    return res.redirect('/not-found');
  }

  return next();
};
