import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const { EXTERNAL_API_KEY } = process.env;

/**
 * Check that the x-api-key header is valid
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
export const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  const {
    headers: { 'x-api-key': xApiKey },
  } = req;

  /**
   * x-api-key is not provided.
   * Reject the request.
   */
  if (!xApiKey) {
    return res.status(401).send('Unauthorised');
  }

  /**
   * x-api-key is valid.
   * Allow the request to continue.
   */
  if (xApiKey === API_KEY) {
    return next();
  }

  /**
   * x-api-key is invalid.
   * Reject the reuqest
   */
  return res.status(401).send('Unauthorised');
};
