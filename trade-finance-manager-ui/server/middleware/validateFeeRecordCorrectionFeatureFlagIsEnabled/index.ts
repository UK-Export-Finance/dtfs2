import { isFeeRecordCorrectionFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { RequestHandler } from 'express';

export const validateFeeRecordCorrectionFeatureFlagIsEnabled: RequestHandler = (req, res, next) => {
  if (!isFeeRecordCorrectionFeatureFlagEnabled()) {
    return res.redirect('/not-found');
  }
  return next();
};
