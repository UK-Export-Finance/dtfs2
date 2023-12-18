import { NextFunction, Request, Response } from 'express';
import { TeamId } from '../../types/team-id';
import { asUserSession } from '../../helpers/express-session';
import { userIsInTeam } from '../../helpers/user';

/**
 * Middleware to check if the user is in at least
 * one of the teams specified in the requiredTeamIds
 * array. If they are not, they are redirected to
 * the redirectUrl, which defaults to '/home' if
 * it is not explicitly provided.
 */
export const validateUserTeam = (requiredTeamIds: TeamId[], redirectUrl = '/home') => (req: Request, res: Response, next: NextFunction) => {
  const { user } = asUserSession(req.session);
  if (userIsInTeam(user, requiredTeamIds)) {
    return next();
  }
  return res.redirect(redirectUrl);
};
