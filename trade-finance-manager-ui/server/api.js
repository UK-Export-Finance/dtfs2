const axios = require('axios');
const apollo = require('./graphql/apollo');
const dealQuery = require('./graphql/queries/deal-query');
const dealsLightQuery = require('./graphql/queries/deals-query-light');
const facilitiesLightQuery = require('./graphql/queries/facilities-query-light');
const facilityQuery = require('./graphql/queries/facility-query');
const teamMembersQuery = require('./graphql/queries/team-members-query');
const updatePartiesMutation = require('./graphql/mutations/update-parties');
const updateFacilityMutation = require('./graphql/mutations/update-facilities');
const updateFacilityRiskProfileMutation = require('./graphql/mutations/update-facility-risk-profile');
const updateTaskMutation = require('./graphql/mutations/update-task');
const updateCreditRatingMutation = require('./graphql/mutations/update-credit-rating');
const updateLossGivenDefaultMutation = require('./graphql/mutations/update-loss-given-default');
const updateProbabilityOfDefaultMutation = require('./graphql/mutations/update-probability-of-default');
const postUnderwriterManagersDecision = require('./graphql/mutations/update-underwriter-managers-decision');
const updateLeadUnderwriterMutation = require('./graphql/mutations/update-lead-underwriter');
const createActivityMutation = require('./graphql/mutations/create-activity');

require('dotenv').config();

const tfmAPIurl = process.env.TRADE_FINANCE_MANAGER_API_URL;

const getDeal = async (id, tasksFilters, activityFilters) => {
  const queryParams = {
    _id: id,
    tasksFilters,
    activityFilters,
  };

  const response = await apollo('GET', dealQuery, queryParams);

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying deal ', response.errors);
  }

  return response.data.deal;
};

const getFacilities = async (queryParams) => {
  const response = await apollo('GET', facilitiesLightQuery, queryParams);

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying facilities ', response.errors);
  }

  if (response?.data?.facilities?.tfmFacilities) {
    return {
      facilities: response.data.facilities.tfmFacilities,
    };
  }

  return { facilities: [] };
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

const createActivity = async (dealId, activityUpdate) => {
  const updateVariable = {
    dealId,
    activityUpdate,
  };

  return apollo('PUT', createActivityMutation, updateVariable);
};

const login = async (username, password) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${tfmAPIurl}/v1/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { username, password },
    });
    let data = '';

    if (response?.data) {
      data = {
        success: response.data.success,
        token: response.data.token,
        user: response.data.user,
      };
    }

    return data;
  } catch (err) {
    console.error('Unable to log in', err?.response?.data);
    return err?.response?.data;
  }
};

const updateUserPassword = async (id, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${tfmAPIurl}/v1/users/${id}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: update,
    }).catch((err) => err.response);

    return response;
  } catch (error) {
    console.error('Unable to update user details', { error });
    return error;
  }
};

const createFeedback = async (formData) => {
  const response = await axios({
    method: 'post',
    url: `${tfmAPIurl}/v1/feedback`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const getUser = async (userId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/users/${userId}`,
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data.user;
  } catch (err) {
    console.error('Unable to get the user details', err?.response?.data);
    return err?.response?.data;
  }
};

const createFacilityAmendment = async (facilityId) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment`,
      headers: { 'Content-Type': 'application/json' },
      data: { facilityId },
    });

    return response.data;
  } catch (err) {
    console.error('Unable to create new amendment %O', { response: err?.response?.data });
    return err?.response?.data;
  }
};

const updateAmendment = async (facilityId, amendmentId, data) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment/${amendmentId}`,
      headers: { 'Content-Type': 'application/json' },
      data,
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to create amendment request %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getAmendmentInProgress = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment/status/in-progress`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendment in progress %O', { response: err?.response?.data });
    return { status: err?.response?.status || 500, data: err?.response?.data };
  }
};

const getAllAmendmentsInProgress = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/amendments/status/in-progress`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendments in progress %O', { response: err?.response?.data });
    return { status: err?.response?.status || 500, data: err?.response?.data };
  }
};

const getCompletedAmendment = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment/status/completed`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the completed amendment %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getLatestCompletedAmendment = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment/status/completed/latest`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the latest completed amendment %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getAmendmentById = async (facilityId, amendmentId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment/${amendmentId}`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendment by Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getAmendmentsByFacilityId = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/facility/${facilityId}/amendment`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendment by Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getAmendmentByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/deal/${dealId}/amendment`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendment by deal Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getAmendmentInProgressByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/deal/${dealId}/amendment/status/in-progress`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the amendment in progress by deal Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getCompletedAmendmentByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/deal/${dealId}/amendment/status/completed`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the completed amendment by deal Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const getLatestCompletedAmendmentByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmAPIurl}/v1/deal/${dealId}/amendment/status/completed/latest`,
      headers: { 'Content-Type': 'application/json' },
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the latest completed amendment by deal Id %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

module.exports = {
  getDeal,
  getDeals,
  getFacility,
  updateFacilityRiskProfile,
  getTeamMembers,
  getUser,
  updateUserPassword,
  updateParty,
  updateFacility,
  updateTask,
  updateCreditRating,
  updateLossGivenDefault,
  updateProbabilityOfDefault,
  updateUnderwriterManagersDecision,
  updateLeadUnderwriter,
  createActivity,
  login,
  getFacilities,
  createFeedback,
  updateAmendment,
  createFacilityAmendment,
  getAmendmentInProgress,
  getCompletedAmendment,
  getLatestCompletedAmendment,
  getAmendmentById,
  getAmendmentsByFacilityId,
  getAmendmentByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
  getAllAmendmentsInProgress,
};
