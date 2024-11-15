import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';

import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';

/**
 * @private
 * Validates that the TFM SSO feature flag is in the correct state to access the endpoint
 * Used internally by validateSsoFeatureFlagIsOn and validateSsoFeatureFlagIsOff
 */
const createValidateSsoFeatureFlagMiddleware =
  ({ desiredFeatureFlagState }: { desiredFeatureFlagState: boolean }): RequestHandler =>
  (req, res, next) => {
    const isFeatureFlagEnabled = isTfmSsoFeatureFlagEnabled();

    const isDesiredStateMatchingFeatureFlagState = desiredFeatureFlagState === isFeatureFlagEnabled;

    if (!isDesiredStateMatchingFeatureFlagState) {
      console.error(
        'Tfm SSO feature flag is in incorrect state to access this endpoint, current feature flag state is %s, desired state is %s',
        isFeatureFlagEnabled,
        desiredFeatureFlagState,
      );

      return res.status(HttpStatusCode.BadRequest).send();
    }

    return next();
  };

/**
 * Validates that the TFM SSO feature flag is off
 * Used to restrict access to endpoints that should not be accessed when the feature flag is on
 */
export const validateSsoFeatureFlagIsOff = createValidateSsoFeatureFlagMiddleware({ desiredFeatureFlagState: false });

/**
 * Validates that the TFM SSO feature flag is on
 * Used to restrict access to endpoints that should not be accessed when the feature flag is off
 */
export const validateSsoFeatureFlagIsOn = createValidateSsoFeatureFlagMiddleware({ desiredFeatureFlagState: true });
