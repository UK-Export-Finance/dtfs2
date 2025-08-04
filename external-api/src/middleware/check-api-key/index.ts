import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const { EXTERNAL_API_KEY } = process.env;

/**
 * Check that the x-api-key header is valid
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {NextFunction} next Callback function name
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
  if (xApiKey === EXTERNAL_API_KEY) {
    return next();
  }

  /**
   * x-api-key is invalid.
   * Reject the request
   */
  return res.status(401).send('Unauthorised');
};
