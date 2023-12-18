import { Request, Response, NextFunction } from 'express';
import { isString } from '../../helpers/string';

export const validateBankId = (req: Request, res: Response, next: NextFunction) => {
  const { bankId } = req.params;
  if (!bankId) {
    console.error('No bank id was provided');
    return res.redirect('/not-found');
  }

  if (!isString(bankId) || !bankId.match(/^\d+$/)) {
    console.error('The bank id provided should be a string of numbers');
    return res.redirect('/not-found');
  }
  return next();
};
