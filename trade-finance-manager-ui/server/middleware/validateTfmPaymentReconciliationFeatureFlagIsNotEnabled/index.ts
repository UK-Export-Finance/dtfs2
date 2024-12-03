import { isTfmPaymentReconciliationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { RequestHandler } from 'express';

export const validateTfmPaymentReconciliationFeatureFlagIsNotEnabled: RequestHandler = (req, res, next) => {
  if (isTfmPaymentReconciliationFeatureFlagEnabled()) {
    return res.redirect('/not-found');
  }
  return next();
};
