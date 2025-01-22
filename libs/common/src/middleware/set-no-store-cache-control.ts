import { Request, Response, NextFunction } from 'express';

/**
 * middleware to set Cache-Control to no-store
 * stops cached version of a page being rendered when going back to a page (using the browser back button)
 * ensures the get controller for the page is called (if cached, get controller for a page is not called)
 * @param req
 * @param res
 * @param next
 */
export const setNoStoreCacheControl = (req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store');
  next();
};
