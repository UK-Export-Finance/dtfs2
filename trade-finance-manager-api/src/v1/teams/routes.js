const express = require('express');
const teamsController = require('../controllers/team.controller');
const { teamIdParamValidator } = require('./team-id-param.validator');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

const teamsRoutes = express.Router();

/**
 * @openapi
 * /teams/{teamId}/members:
 *   get:
 *     summary: Get all members of a team
 *     description: |
 *       Get all members of the team with the given teamId.
 *       Note that the endpoint does not validate if there is a team with that teamId
 *       (it will return a 200 response with an empty array in that case).
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *           enum:
 *             - BUSINESS_SUPPORT
 *             - PIM
 *             - RISK_MANAGERS
 *             - UNDERWRITERS
 *             - UNDERWRITER_MANAGERS
 *             - UNDERWRITING_SUPPORT
 *         required: true
 *         description: The ID of the team to get members of.
 *     responses:
 *       200:
 *         description: An array of the members of the team matching the given teamId.
 *         content:
 *           application/json:
 *             example: { teamMembers: [{ _id: '507f1f77bcf86cd799439011', firstName: 'First', lastName: 'Last' }] }
 *             schema:
 *               type: object
 *               properties:
 *                 teamMembers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                     required:
 *                       - _id
 *                       - firstName
 *                       - lastName
 *               required:
 *                 - teamMembers
 *       400:
 *         description: Bad Request.
 */
teamsRoutes.route('/teams/:teamId/members').get(teamIdParamValidator(), handleExpressValidatorResult, async (req, res) => {
  const teamMembersOrError = await teamsController.findTeamMembers(req.params.teamId);

  if (Object.hasOwn(teamMembersOrError, 'status')) {
    const { status, data } = teamMembersOrError;
    return res.status(status).send({ status, data });
  }

  const sanitizedTeamMembers = teamMembersOrError.map(({ _id, firstName, lastName }) => ({
    _id,
    firstName,
    lastName,
  }));
  return res.status(200).send({ teamMembers: sanitizedTeamMembers });
});

module.exports = {
  teamsRoutes,
};
