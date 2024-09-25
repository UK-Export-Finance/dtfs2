import { RequestHandler } from 'express';
import { HttpStatusCode } from 'axios';
import { isTfmDealCancellationFeatureFlagEnabled } from '../../helpers';

/**
 * Middleware to check if the deal cancellation feature flag is enabled
 */
export const validateDealCancellationEnabled: RequestHandler = (req, res, next) => {
  if (!isTfmDealCancellationFeatureFlagEnabled()) {
    console.info(`Deal Cancellation feature flag disabled, accessing ${req.originalUrl}`);
    return res.sendStatus(HttpStatusCode.NotFound);
  }

  return next();
};
