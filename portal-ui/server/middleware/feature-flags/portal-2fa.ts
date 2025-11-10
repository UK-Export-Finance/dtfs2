import { RequestHandler } from 'express';
import { generateFrontendFeatureFlagMiddleware, isPortal2FAFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the FF_PORTAL_2FA_ENABLED is enabled
 */
export const validatePortal2FAEnabled: RequestHandler = generateFrontendFeatureFlagMiddleware('FF_PORTAL_2FA_ENABLED', () => isPortal2FAFeatureFlagEnabled());
