import { Request, Response, NextFunction } from 'express';

/**
 * Global middleware, ensures page cannot be indexed or followed when queried in a search engine.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
export const seo = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  next();
};
