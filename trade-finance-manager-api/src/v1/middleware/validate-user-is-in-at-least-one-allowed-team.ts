import { TeamId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';

/**
 * Creates a middleware that returns a 403 error if the current user is not part of
 * at least one of the allowed teams, and calls the next handler otherwise.
 */
export const validateUserHasAtLeastOneAllowedTeam =
  (allowedTeams: TeamId[]): RequestHandler =>
  (req, res, next) => {
    const { user } = req;

    const userHasAtLeastOneAllowedTeam = allowedTeams.some((allowedTeam) => user.teams.includes(allowedTeam));

    if (!userHasAtLeastOneAllowedTeam) {
      console.error('Unauthorised access, expected user team to be one of: %s, but user was: %s.', allowedTeams, user);

      return res.status(HttpStatusCode.Forbidden).send({ success: false, msg: "You don't have access to this page" });
    }

    return next();
  };
