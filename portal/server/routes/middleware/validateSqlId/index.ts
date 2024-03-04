import { NextFunction, Request, Response } from 'express';
import { isValidSqlId } from '../../../validation/validate-ids';

export const validateSqlId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!isValidSqlId(id)) {
    console.error(`Invalid SQL 'id' param provided: '${id}'`);
    return res.redirect('/not-found');
  }

  return next();
};
