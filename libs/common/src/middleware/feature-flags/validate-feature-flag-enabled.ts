import { RequestHandler } from 'express';
import { HttpStatusCode } from 'axios';
import { isPortalFacilityAmendmentsFeatureFlagEnabled, isTfmDealCancellationFeatureFlagEnabled } from '../../helpers';
import { FeatureFlag, isFeeRecordCorrectionFeatureFlagEnabled, isPortal2FAFeatureFlagEnabled } from '../../helpers/is-feature-flag-enabled';

/**
 * Creates a middleware function to check if the given feature flag is enabled
 *
 * This will send status `404` if the feature flag is disabled and call `next` otherwise
 *
 * @param featureFlagName - the feature flag
 * @param isFeatureFlagEnabled - function to check if the feature flag is enabled */
const generateBackendFeatureFlagMiddleware =
  (featureFlagName: FeatureFlag, isFeatureFlagEnabled: () => boolean): RequestHandler =>
  (req, res, next) => {
    if (!isFeatureFlagEnabled()) {
      console.info(`Feature flag ${featureFlagName} disabled whilst accessing ${req.originalUrl}`);
      return res.sendStatus(HttpStatusCode.NotFound);
    }

    return next();
  };

/**
 * Creates a middleware function to check if the given feature flag is enabled
 *
 * This will redirect to `/not-found` if the feature flag is disabled and call `next` otherwise
 *
 * @param featureFlagName - the feature flag
 * @param isFeatureFlagEnabled - function to check if the feature flag is enabled
 */
export const generateFrontendFeatureFlagMiddleware =
  (featureFlagName: FeatureFlag, isFeatureFlagEnabled: () => boolean): RequestHandler =>
  (req, res, next) => {
    if (!isFeatureFlagEnabled()) {
      console.info(`Feature flag ${featureFlagName} disabled whilst accessing ${req.originalUrl}`);
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

/**
 * Frontend middleware to check if the fee record correction feature flag is enabled
 */
export const validateFeeRecordCorrectionFeatureFlagIsEnabled = generateFrontendFeatureFlagMiddleware('FF_FEE_RECORD_CORRECTION_ENABLED', () =>
  isFeeRecordCorrectionFeatureFlagEnabled(),
);

export const validatePortal2FAFeatureFlagIsEnabled = generateFrontendFeatureFlagMiddleware('FF_PORTAL_2FA_ENABLED', () => isPortal2FAFeatureFlagEnabled());
