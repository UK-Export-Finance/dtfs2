import { Request, Response, NextFunction } from 'express';
import { isValidSqlId } from '../../helpers/validateIds';

export type ValidateSqlIdRequest = Request<{ [paramName: string]: string }>;

/**
 * Generates the middleware to validate that the path parameter
 * matching the supplied param name is a valid SQL id integer
 * @param paramName - The parameter name
 * @returns The validator
 */
export const validateSqlId = (paramName: string) => (req: ValidateSqlIdRequest, res: Response, next: NextFunction) => {
  const id = req.params[paramName];

  if (!isValidSqlId(id)) {
    console.error(`Invalid SQL '${paramName}' param provided: '${id}'`);
    return res.redirect('/not-found');
  }

  return next();
};
