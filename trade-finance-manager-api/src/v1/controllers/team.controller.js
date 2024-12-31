import { HttpStatusCode } from 'axios';
import { USER_STATUS } from '@ukef/dtfs2-common';
import api from '../api';

/**
 * Maps team members to a specific format and filters out inactive users.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.teamId - The ID of the team.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {Error} - Throws an error if there is an issue with mapping team members.
 */
export const mapTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await api.findTeamMembers(teamId);

    // Upon failure
    if (members?.status) {
      const { status, data } = members;
      return res.status(status).send({ status, data });
    }

    // Only active users
    const activeMembers = members.filter(({ status }) => status === USER_STATUS.ACTIVE);

    // Expected response
    const teamMembers = activeMembers.map(({ _id, firstName, lastName }) => ({
      _id,
      firstName,
      lastName,
    }));

    return res.status(HttpStatusCode.Ok).send({ teamMembers });
  } catch (error) {
    console.error('An error occurred while mapping TFM team members %o', error);
    return res.status(HttpStatusCode.InternalServerError).send();
  }
};
