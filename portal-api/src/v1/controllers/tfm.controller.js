const { ALL_TEAM_IDS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { getTfmTeam, getTfmDeal, getTfmFacility } = require('../api');

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
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.teamId - The ID of the TFM team to retrieve
 * @param {object} res - Express response object
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

/**
 * Handles the request to retrieve a TFM deal by its ID.
 *
 * The endpoint check whether the provided `dealId` is not falsy.
 * If valid then retiereves the TFM deals from `tfm-deals` collection using
 * provided `dealId` parameter.
 * Returns the deal information if successful, or an appropriate error response otherwise.
 *
 * @async
 * @function tfmDeal
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} An express response is returned using the `res` parameter.
 */
exports.tfmDeal = async (req, res) => {
  try {
    const { dealId } = req.params;

    if (!dealId) {
      console.error('Invalid TFM deal ID %s provided', dealId);
      return res.status(HttpStatusCode.BadRequest).send('Invalid TFM deal ID provided');
    }

    const response = await getTfmDeal(dealId);

    if (!response?.data?.deal) {
      throw new Error('Invalid TFM deal response received');
    }

    return res.status(HttpStatusCode.Ok).send(response.data.deal);
  } catch (error) {
    console.error('Unable to get the TFM deal with ID %s %o', req.params?.dealId, error);
    return res.status(HttpStatusCode.InternalServerError).send('Unable to get the TFM deal');
  }
};

/**
 * Handles the request to retrieve a TFM facility by its ID.
 *
 * The endpoint check whether the provided `facilityId` is not falsy.
 * If valid then retiereves the TFM facility from `tfm-facilities` collection using
 * provided `facilityId` parameter.
 * Returns the tfm facility information if successful, or an appropriate error response otherwise.
 *
 * @async
 * @function tfmDeal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} An express response is returned using the `res` parameter.
 */
exports.tfmFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;

    if (!facilityId) {
      console.error('Invalid TFM facility ID %s provided', facilityId);
      return res.status(HttpStatusCode.BadRequest).send('Invalid TFM facility ID provided');
    }

    const response = await getTfmFacility(facilityId);

    if (!response?.data) {
      throw new Error('Invalid TFM facility response received');
    }

    return res.status(HttpStatusCode.Ok).send(response.data);
  } catch (error) {
    console.error('Unable to get the TFM facility with ID %s %o', req.params?.facilityId, error);
    return res.status(HttpStatusCode.InternalServerError).send('Unable to get the TFM facility');
  }
};
