import axios from 'axios';
import apollo from './graphql/apollo';
import dealQuery from './graphql/queries/deal-query';
import dealsQuery from './graphql/queries/deals-query';
import facilityQuery from './graphql/queries/facility-query';
import teamMembersQuery from './graphql/queries/team-members-query';
import updatePartiesMutation from './graphql/mutations/update-parties';
import updateFacilityMutation from './graphql/mutations/update-facilities';
import updateTaskMutation from './graphql/mutations/update-task';

require('dotenv').config();

const urlRoot = process.env.TRADE_FINANCE_MANAGER_API_URL;

const getDeal = async (id) => {
  const response = await apollo('GET', dealQuery, { id });
  return response.data.deal;
};

const getDeals = async () => {
  const response = await apollo('GET', dealsQuery);
  return response.data.deals;
};

const getFacility = async (id) => {
  const response = await apollo('GET', facilityQuery, { id });

  return response.data.facility;
};

const getTeamMembers = async (teamId) => {
  const response = await apollo('GET', teamMembersQuery, { teamId });

  return response.data.teamMembers;
};

const updateParty = async (id, partyUpdate) => {
  const updateVariables = {
    id,
    partyUpdate,
  };

  const response = await apollo('PUT', updatePartiesMutation, updateVariables);
  return response;
};

const updateFacility = async (id, facilityUpdate) => {
  const updateVariables = {
    id,
    facilityUpdate,
  };
  const response = await apollo('PUT', updateFacilityMutation, updateVariables);
  return response;
};

const updateTask = async (dealId, taskUpdate) => {
  const updateVariables = {
    dealId,
    taskUpdate,
  };

  const response = await apollo('PUT', updateTaskMutation, updateVariables);

  return response;
};

// Temp login for mock users. Active Directory will proabably replace this
// Just get the user, not really concerned about logging in with passwords for mock users
const login = async (username) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/v1/users/${username}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.user;
  } catch (err) {
    return false;
  }
};

export default {
  getDeal,
  getDeals,
  getFacility,
  getTeamMembers,
  updateParty,
  updateFacility,
  updateTask,
  login,
};
