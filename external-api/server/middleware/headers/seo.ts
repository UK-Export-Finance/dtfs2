import { Request, Response, NextFunction } from 'express';

/**
 * Global middleware, ensures page cannot be indexed or followed when queried in a search engine.
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {NextFunction} next Callback function name
 */
export const seo = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  next();
};
