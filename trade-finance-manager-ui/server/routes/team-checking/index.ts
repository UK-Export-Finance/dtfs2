import express, { Request, Response } from 'express';
import { isProduction } from '@ukef/dtfs2-common';
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
  if (isProduction()) {
    return;
  }

  const teamCombinations = getTeamCombinations();

  /**
   * @openapi
   * /:
   *   get:
   *     summary: Get team checking page
   *     tags: [TFM]
   *     description: Get team checking page
   *     responses:
   *       200:
   *         description: Ok
   */
  teamCheckingRoutes.get('/', (req: Request, res: Response) => renderTeamsChecker(req, res, { teamCombinations }));

  teamCombinations.forEach((teamCombination) => {
    /**
     * @openapi
     * /${teamCombination.url}:
     *   get:
     *     summary: Get team checking page
     *     tags: [TFM]
     *     description: Get team checking page
     *     responses:
     *       200:
     *         description: Ok
     */
    teamCheckingRoutes.get(`/${teamCombination.url}`, (req: Request, res: Response) =>
      renderTeamsChecker(req, res, { teamCombinations, currentPageTeamRestrictions: teamCombination }),
    );
  });
}
