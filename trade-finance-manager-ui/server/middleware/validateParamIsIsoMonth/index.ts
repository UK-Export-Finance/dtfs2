import { NextFunction, Request, Response } from 'express';
import { isValidIsoMonth } from '../../helpers/date';

export const validateParamIsIsoMonth = (param: string) => (req: Request, res: Response, next: NextFunction) => {
  const isoMonth = req.params[param];
  if (!isoMonth || !isValidIsoMonth(isoMonth)) {
    console.error('Invalid submission month provided: %s', isoMonth);
    return res.redirect('/not-found');
  }
  return next();
};
