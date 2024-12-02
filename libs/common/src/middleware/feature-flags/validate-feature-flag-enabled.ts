import { RequestHandler } from 'express';
import { HttpStatusCode } from 'axios';
import { isPortalFacilityAmendmentsFeatureFlagEnabled, isTfmDealCancellationFeatureFlagEnabled } from '../../helpers';
import { FeatureFlag } from '../../helpers/is-feature-flag-enabled';

/**
 * Creates a middleware function to check if the given feature flag is enabled
 *
 * This will send status `404` if the feature flag is disabled and call `next` otherwise
 */
const generateBackendFeatureFlagMiddleware =
  (featureFlagName: FeatureFlag, isFeatureFlagEnabled: () => boolean): RequestHandler =>
  (req, res, next) => {
    if (!isFeatureFlagEnabled()) {
      console.info(`Feature flag ${featureFlagName} disabled, accessing ${req.originalUrl}`);
      return res.sendStatus(HttpStatusCode.NotFound);
    }

    return next();
  };

/**
 * Creates a middleware function to check if the given feature flag is enabled
 *
 * This will redirect to `/not-found` if the feature flag is disabled and call `next` otherwise
 */
export const generateFrontendFeatureFlagMiddleware =
  (featureFlagName: FeatureFlag, isFeatureFlagEnabled: () => boolean): RequestHandler =>
  (req, res, next) => {
    if (!isFeatureFlagEnabled()) {
      console.info(`Feature flag ${featureFlagName} disabled, accessing ${req.originalUrl}`);
      return res.redirect('/not-found');
    }

    return next();
  };

/**
 * Backend middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled = generateBackendFeatureFlagMiddleware('FF_TFM_DEAL_CANCELLATION_ENABLED', () =>
  isTfmDealCancellationFeatureFlagEnabled(),
);

/**
 * Backend middleware to check if the portal amendments feature flag is enabled
 */
export const validatePortalFacilityAmendmentsEnabled = generateBackendFeatureFlagMiddleware('FF_PORTAL_FACILITY_AMENDMENTS_ENABLED', () =>
  isPortalFacilityAmendmentsFeatureFlagEnabled(),
);
