import { Request, Response, NextFunction } from 'express';

/**
 * middleware to set Cache-Control to no-store, no-cache, must-revalidate and max-age=0
 * stops cached version of a page being rendered when going back to a page (using the browser back button)
 * ensures the get controller for the page is called
 * @param _req
 * @param res
 * @param next
 */
export const setNoStoreCacheControl = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');

  next();
};
