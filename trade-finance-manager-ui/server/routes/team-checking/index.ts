/**
 * These routes are only used for role checking
 */

import express, { Request, Response } from 'express';
import { renderTeamsChecker } from '../../controllers/team-checking';
import { getTeamCombinations } from '../../helpers/team-checking.helper';

export const teamCheckingRoutes = express.Router();

populateTeamCheckingRouter();

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
