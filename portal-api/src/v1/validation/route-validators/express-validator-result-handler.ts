import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to be used with express-validator validations.
 * Returns a 400 error if any previous validations have failed.
 */
export const handleExpressValidatorResult = (req: Request, res: Response, next: NextFunction): void => {
  const validationResults = validationResult(req);
  if (!validationResults.isEmpty()) {
    res.status(400).json({ message: 'Bad Request', errors: validationResults.array() });
    return;
  }

  next();
};
