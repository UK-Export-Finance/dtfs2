import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';

/**
 * Middleware to validate the state of the TFM SSO feature flag before allowing access to an endpoint.
 *
 * @param {Object} options - Configuration options for the middleware.
 * @param {boolean} options.desiredState - The desired state of the TFM SSO feature flag (true for enabled, false for disabled).
 * @returns {RequestHandler} A middleware function that checks the feature flag state and either proceeds to the next middleware or returns a 400 Bad Request response.
 */
const validateSsoFeatureFlag =
  ({ desiredState }: { desiredState: boolean }): RequestHandler =>
  (req, res, next) => {
    const isFeatureFlagEnabled = isTfmSsoFeatureFlagEnabled();
    const isDesiredStateTrue = desiredState === isFeatureFlagEnabled;

    if (!isDesiredStateTrue) {
      console.error(
        'TFM SSO feature flag is in incorrect state to access this endpoint, current feature flag state is %s whereas the desired state is %s',
        isFeatureFlagEnabled,
        desiredState,
      );

      return res.status(HttpStatusCode.BadRequest).send();
    }

    return next();
  };

/**
 * Middleware to validate that the SSO (Single Sign-On) feature flag is set to `false`.
 * This ensures that the desired state of the SSO feature is disabled.
 *
 * @constant
 */
export const validateSsoFeatureFlagFalse = validateSsoFeatureFlag({ desiredState: false });

/**
 * Middleware to validate that the Single Sign-On (SSO) feature flag is enabled.
 * This function ensures that the desired state of the SSO feature flag is set to `true`.
 *
 * @constant
 */
export const validateSsoFeatureFlagTrue = validateSsoFeatureFlag({ desiredState: true });
