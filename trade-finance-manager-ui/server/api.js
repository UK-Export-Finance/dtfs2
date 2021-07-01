import axios from 'axios';
import apollo from './graphql/apollo';
import dealQuery from './graphql/queries/deal-query';
import dealsQuery from './graphql/queries/deals-query';
import facilityQuery from './graphql/queries/facility-query';
import teamMembersQuery from './graphql/queries/team-members-query';
import updatePartiesMutation from './graphql/mutations/update-parties';
import updateFacilityMutation from './graphql/mutations/update-facilities';
import updateFacilityRiskProfileMutation from './graphql/mutations/update-facility-risk-profile';
import updateTaskMutation from './graphql/mutations/update-task';
import updateCreditRatingMutation from './graphql/mutations/update-credit-rating';
import updateLossGivenDefaultMutation from './graphql/mutations/update-loss-given-default';
import updateProbabilityOfDefaultMutation from './graphql/mutations/update-probability-of-default';
import postUnderwriterManagersDecision from './graphql/mutations/update-underwriter-managers-decision';
import updateLeadUnderwriterMutation from './graphql/mutations/update-lead-underwriter';

require('dotenv').config();

const urlRoot = process.env.TRADE_FINANCE_MANAGER_API_URL;

const getDeal = async (id, tasksFilters) => {
  const queryParams = {
    _id: id, // eslint-disable-line no-underscore-dangle
    tasksFilters,
  };

  const response = await apollo('GET', dealQuery, queryParams);
  return response.data.deal;
};

const getDeals = async (queryParams) => {
  const response = await apollo('GET', dealsQuery, queryParams);

  const { deals: dealsObj } = response.data;

  return {
    deals: dealsObj.deals,
    count: dealsObj.count,
  };
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

const updateFacilityRiskProfile = async (id, facilityUpdate) => {
  const updateVariables = {
    id,
    facilityUpdate,
  };
  const response = await apollo('PUT', updateFacilityRiskProfileMutation, updateVariables);
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

const updateCreditRating = async (dealId, creditRatingUpdate) => {
  const updateVariables = {
    dealId,
    creditRatingUpdate,
  };

  const response = await apollo('PUT', updateCreditRatingMutation, updateVariables);
  return response;
};

const updateLossGivenDefault = async (dealId, lossGivenDefaultUpdate) => {
  const updateVariables = {
    dealId,
    lossGivenDefaultUpdate,
  };

  const response = await apollo('PUT', updateLossGivenDefaultMutation, updateVariables);
  return response;
};

const updateProbabilityOfDefault = async (dealId, probabilityOfDefaultUpdate) => {
  const updateVariables = {
    dealId,
    probabilityOfDefaultUpdate,
  };

  const response = await apollo('PUT', updateProbabilityOfDefaultMutation, updateVariables);
  return response;
};

const updateUnderwriterManagersDecision = async (dealId, update) => {
  const updateVariables = {
    dealId,
    managersDecisionUpdate: update,
  };

  const response = await apollo('PUT', postUnderwriterManagersDecision, updateVariables);

  return response;
};

const updateLeadUnderwriter = async (dealId, leadUnderwriterUpdate) => {
  const updateVariables = {
    dealId,
    leadUnderwriterUpdate,
  };

  const response = await apollo('PUT', updateLeadUnderwriterMutation, updateVariables);

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
  updateFacilityRiskProfile,
  getTeamMembers,
  updateParty,
  updateFacility,
  updateTask,
  updateCreditRating,
  updateLossGivenDefault,
  updateProbabilityOfDefault,
  updateUnderwriterManagersDecision,
  updateLeadUnderwriter,
  login,
};
