import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { isMaintenanceActive } from '../../helpers/is-maintenance-active';
import { MAINTENANCE } from '../../constants';

/**
 * Express middleware to handle scheduled maintenance mode.
 *
 * If maintenance is active, responds with HTTP 503 Service Unavailable,
 * sets appropriate headers (`Retry-After`, `Cache-Control`, `X-UKEF-Maintenance-Active`),
 * and returns a message indicating the service is under maintenance.
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
    console.info('⚙️ System under scheduled maintenance for request %s.', req.path);

    return res
      .set('Retry-After', MAX_AGE)
      .set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      .set('X-UKEF-Maintenance-Active', String(isActive))
      .status(HttpStatusCode.ServiceUnavailable)
      .send({ message: `Service is under schedule maintenance, please try again after ${MAX_AGE} seconds.` });
  }

  return next();
};
