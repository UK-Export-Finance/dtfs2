import { HttpStatusCode } from 'axios';
import { validationResult } from 'express-validator';

/**
 * Validation middleware, used on a per route basis to handle result of validations that are run on the inputs of an API route.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const handleExpressValidatorResult = (req, res, next) => {
  const validationResults = validationResult(req);
  if (!validationResults.isEmpty()) {
    return res.status(HttpStatusCode.BadRequest).json({ status: HttpStatusCode.BadRequest, errors: validationResults.array() });
  }
  return next();
};

export default handleExpressValidatorResult;
