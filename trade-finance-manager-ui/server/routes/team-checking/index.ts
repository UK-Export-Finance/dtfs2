import express, { Request, Response } from 'express';
import { renderTeamsChecker } from '../../controllers/team-checking';
import { getTeamCombinations } from '../../helpers/team-checking.helper';

export const teamCheckingRoutes = express.Router();

populateTeamCheckingRouter();

/**
 * Populates the team checking router with routes for role checking.
 *
 * If the application is running in production mode, the routes are not populated, as these routes are only used to aid in SSO role assignment testing.
 */
function populateTeamCheckingRouter() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const teamCombinations = getTeamCombinations();

  teamCheckingRoutes.get('/', (req: Request, res: Response) => renderTeamsChecker(req, res, { teamCombinations }));

  teamCombinations.forEach((teamCombination) => {
    teamCheckingRoutes.get(`/${teamCombination.url}`, (req: Request, res: Response) =>
      renderTeamsChecker(req, res, { teamCombinations, currentPageTeamRestrictions: teamCombination }),
    );
  });
}
