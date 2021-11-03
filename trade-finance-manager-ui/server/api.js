const axios = require('axios');
const apollo = require('./graphql/apollo');
const dealQuery = require('./graphql/queries/deal-query');
const dealsLightQuery = require('./graphql/queries/deals-query-light');
const facilityQuery = require('./graphql/queries/facility-query');
const teamMembersQuery = require('./graphql/queries/team-members-query');
const userQuery = require('./graphql/queries/user-query');
const updatePartiesMutation = require('./graphql/mutations/update-parties');
const updateFacilityMutation = require('./graphql/mutations/update-facilities');
const updateFacilityRiskProfileMutation = require('./graphql/mutations/update-facility-risk-profile');
const updateTaskMutation = require('./graphql/mutations/update-task');
const updateCreditRatingMutation = require('./graphql/mutations/update-credit-rating');
const updateLossGivenDefaultMutation = require('./graphql/mutations/update-loss-given-default');
const updateProbabilityOfDefaultMutation = require('./graphql/mutations/update-probability-of-default');
const postUnderwriterManagersDecision = require('./graphql/mutations/update-underwriter-managers-decision');
const updateLeadUnderwriterMutation = require('./graphql/mutations/update-lead-underwriter');
const updateCommentMutation = require ('./graphql/mutations/update-comment');

require('dotenv').config();

const urlRoot = process.env.TRADE_FINANCE_MANAGER_API_URL;

const getDeal = async (id, tasksFilters) => {
  const queryParams = {
    _id: id, // eslint-disable-line no-underscore-dangle
    tasksFilters,
  };

  const response = await apollo('GET', dealQuery, queryParams);

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying deal ', response.errors);
  }

  return response.data.deal;
};

const getDeals = async (queryParams) => {
  const response = await apollo('GET', dealsLightQuery, queryParams);

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying deals ', response.errors);
  }

  if (response.data && response.data.dealsLight) {
    return {
      deals: response.data.dealsLight.deals,
      count: response.data.dealsLight.count,
    };
  }

  return {
    deals: [],
    count: 0,
  };
};

const getFacility = async (id) => {
  const response = await apollo('GET', facilityQuery, { id });

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying facility ', response.errors);
  }

  return response.data.facility;
};

const getTeamMembers = async (teamId) => {
  const response = await apollo('GET', teamMembersQuery, { teamId });

  return response.data.teamMembers;
};

const getUser = async (userId) => {
  const response = await apollo('GET', userQuery, { userId });

  return response.data.user;
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

const updateActivityComment = async (dealID, commentUpdate) => {

  const updateVariables = {
    dealID,
    commentUpdate,
  };

  const response = await apollo('PUT',  updateCommentMutation , updateVariables)

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

module.exports = {
  getDeal,
  getDeals,
  getFacility,
  updateFacilityRiskProfile,
  getTeamMembers,
  getUser,
  updateParty,
  updateFacility,
  updateTask,
  updateCreditRating,
  updateLossGivenDefault,
  updateProbabilityOfDefault,
  updateUnderwriterManagersDecision,
  updateLeadUnderwriter,
  updateActivityComment,
  login,
};
