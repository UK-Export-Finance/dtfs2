import { RequestHandler } from 'express';
import { generateFrontendFeatureFlagMiddleware, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled
 */
export const validatePortalFacilityAmendmentsEnabled: RequestHandler = generateFrontendFeatureFlagMiddleware('FF_PORTAL_FACILITY_AMENDMENTS_ENABLED', () =>
  isPortalFacilityAmendmentsFeatureFlagEnabled(),
);
