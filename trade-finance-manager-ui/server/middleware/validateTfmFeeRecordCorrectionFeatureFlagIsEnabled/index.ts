import { isFeeRecordCorrectionFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { RequestHandler } from 'express';

export const validateTfmFeeRecordCorrectionFeatureFlagIsEnabled: RequestHandler = (req, res, next) => {
  if (!isFeeRecordCorrectionFeatureFlagEnabled()) {
    return res.redirect('/not-found');
  }
  return next();
};
