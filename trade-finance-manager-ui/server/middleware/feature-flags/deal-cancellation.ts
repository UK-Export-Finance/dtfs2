import { RequestHandler } from 'express';
import { generateFrontendFeatureFlagMiddleware, isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = generateFrontendFeatureFlagMiddleware(() => isTfmDealCancellationFeatureFlagEnabled());
