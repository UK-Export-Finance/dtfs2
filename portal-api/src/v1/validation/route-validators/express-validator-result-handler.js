import { validationResult } from 'express-validator';

/**
 * Middleware to be used with express-validator validations.
 * Returns a 400 error if any previous validations have failed.
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Next callback
 */
export const handleValidationResult = (req, res, next) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    res.status(400).json({ message: 'Bad Request', errors: validationResults.array() });
    return;
  }

  next();
};
