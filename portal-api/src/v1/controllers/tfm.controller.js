const { ALL_TEAM_IDS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { getTfmTeam } = require('../api');

/**
 * Handles the request to retrieve a TFM team by its ID.
 *
 * This endpoint checks whether the provided `teamId` is valid by comparing it
 * against a predefined list of allowed team IDs (`ALL_TEAM_IDS`). If valid,
 * it attempts to fetch the team details using the `getTfmTeam` function.
 * Returns the team information if successful, or an appropriate error response otherwise.
 *
 * @async
 * @function tfmTeam
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.teamId - The ID of the TFM team to retrieve
 * @param {Object} res - Express response object
 * @returns {Promise<void>} A response is sent directly via the `res` object.
 *
 * @throws Will return HTTP 400 if the teamId is invalid.
 * @throws Will return HTTP 500 if an error occurs while retrieving the team data.
 */
exports.tfmTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const isValidId = Object.values(ALL_TEAM_IDS).includes(teamId);

    if (!isValidId) {
      console.error('Invalid TFM team ID %s provided', teamId);
      return res.status(HttpStatusCode.BadRequest).send(`Invalid TFM team ID provided ${teamId}`);
    }

    const response = await getTfmTeam(teamId);

    if (!response?.data?.team) {
      throw new Error('Invalid response received');
    }

    return res.status(HttpStatusCode.Ok).send(response.data.team);
  } catch (error) {
    console.error('Unable to get the TFM team with ID %s %o', req.params?.teamId, error);
    return res.status(HttpStatusCode.InternalServerError).send('Unable to get the TFM team');
  }
};
