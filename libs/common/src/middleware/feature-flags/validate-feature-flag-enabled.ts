import { RequestHandler } from 'express';
import { HttpStatusCode } from 'axios';
import { isPortalFacilityAmendmentsFeatureFlagEnabled, isTfmDealCancellationFeatureFlagEnabled } from '../../helpers';

/**
 * Creates a middleware function to check if the given feature flag is enabled
 */
const generateFeatureFlagMiddleware =
  (isFeatureFlagEnabled: () => boolean): RequestHandler =>
  (req, res, next) => {
    if (!isFeatureFlagEnabled()) {
      console.info(`Feature flag disabled, accessing ${req.originalUrl}`);
      return res.sendStatus(HttpStatusCode.NotFound);
    }

    return next();
  };

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled = generateFeatureFlagMiddleware(() => isTfmDealCancellationFeatureFlagEnabled());

/**
 * Middleware to check if the portal amendments feature flag is enabled
 */
export const validatePortalFacilityAmendmentsEnabled = generateFeatureFlagMiddleware(() => isPortalFacilityAmendmentsFeatureFlagEnabled());
