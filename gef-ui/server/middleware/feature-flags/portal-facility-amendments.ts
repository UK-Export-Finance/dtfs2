import { RequestHandler } from 'express';
import { generateFrontendFeatureFlagMiddleware, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the portal facility amendments feature flag is enabled
 */
export const validatePortalFacilityAmendmentsEnabled: RequestHandler = generateFrontendFeatureFlagMiddleware(() =>
  isPortalFacilityAmendmentsFeatureFlagEnabled(),
);
