import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { isMaintenanceActive, getMaintenanceTimestamp } from '../../helpers';
import { MAINTENANCE } from '../../constants';

/**
 * Express middleware to handle scheduled maintenance mode.
 *
 * If maintenance is active, responds with a 503 Service Unavailable status,
 * sets appropriate headers, and renders a maintenance page for HTML requests.
 * For non-HTML requests, returns a JSON message indicating maintenance status.
 * Otherwise, passes control to the next middleware.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const maintenance = (req: Request, res: Response, next: NextFunction) => {
  const { MAX_AGE } = MAINTENANCE;
  const isActive = isMaintenanceActive();

  if (isActive) {
    const maintenanceUntil = getMaintenanceTimestamp();
    console.info('⚙️ System under scheduled maintenance for request %s until %s.', req.path, maintenanceUntil);

    res
      .set('Retry-After', MAX_AGE)
      .set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      .set('X-UKEF-Maintenance-Active', String(isActive))
      .status(HttpStatusCode.ServiceUnavailable);

    if (req.accepts('html')) {
      return res.render('maintenance.njk', {
        message: `You will be able to use the service from ${maintenanceUntil}.`,
      });
    }

    return res.send({ message: `The service is currently under maintenance. Please try again after ${MAX_AGE} seconds.` });
  }

  return next();
};
