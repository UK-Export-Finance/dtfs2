import { isTfmPaymentReconciliationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { RequestHandler } from 'express';

export const validateTfmPaymentReconciliationFeatureFlagIsEnabled: RequestHandler = (req, res, next) => {
  if (!isTfmPaymentReconciliationFeatureFlagEnabled()) {
    return res.redirect('/not-found');
  }
  return next();
};
