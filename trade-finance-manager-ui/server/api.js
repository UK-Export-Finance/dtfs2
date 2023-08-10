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
const { isValidMongoId, isValidPartyUrn } = require('./helpers/validateIds');

require('dotenv').config();

const { TFM_API_URL, TFM_API_KEY } = process.env;

const generateHeaders = (token) => ({
  Authorization: token,
  'Content-Type': 'application/json',
  'x-api-key': TFM_API_KEY,
});

const getDeal = async (id, tasksFilters, activityFilters) => {
  const queryParams = {
    _id: id,
    tasksFilters,
    activityFilters,
  };

  const response = await apollo('GET', dealQuery, queryParams);

  if (response.errors || response.networkError) {
    console.error('TFM UI - GraphQL error querying deal %O', response.errors || response.networkError.result.errors);
  }

  return response?.data?.deal;
};

const getFacilities = async (queryParams) => {
  const response = await apollo('GET', facilitiesLightQuery, queryParams);

  if (response.errors) {
    console.error('TFM UI - GraphQL error querying facilities %O', response.errors);
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
    console.error('TFM UI - GraphQL error querying deals %O', response.errors);
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
    console.error('TFM UI - GraphQL error querying facility %O', response.errors);
  }

  return response?.data?.facility;
};

const getTeamMembers = async (teamId) => {
  try {
    const response = await apollo('GET', teamMembersQuery, { teamId });
    return response?.data?.teamMembers ? response?.data?.teamMembers : [];
  } catch (error) {
    console.error('Error getting team members %O', error);
    return [];
  }
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

  const response = await apollo('PUT', createActivityMutation, updateVariable);

  return response;
};

const login = async (username, password) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${TFM_API_URL}/v1/login`,
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
  } catch (error) {
    console.error('Unable to log in %O', error?.response?.data);
    return { status: error?.response?.status || 500, data: 'Failed to login' };
  }
};

const updateUserPassword = async (userId, update, token) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('updateUserPassword: Invalid user id provided: %s', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeaders(token),
      data: update,
    }).catch((error) => {
      console.error('Unable to update user details in axios request %O', error);
      return { status: error?.response?.status || 500, data: 'Failed to update user password' };
    });

    return response;
  } catch (error) {
    console.error('Unable to update user details %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update user password' };
  }
};

const createFeedback = async (formData, token) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/feedback`,
    headers: generateHeaders(token),
    data: formData,
  });
  return response.data;
};

const getUser = async (userId, token) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('getUser: Invalid user id provided: %s', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeaders(token),
    });

    return response.data.user;
  } catch (error) {
    console.error('Unable to get the user details %O', error?.response?.data);
    return { status: error?.response?.status || 500, data: 'Failed to get user' };
  }
};

const createFacilityAmendment = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('createFacilityAmendment: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'post',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments`,
      headers: generateHeaders(token),
      data: { facilityId },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to create new amendment %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to create facility amendment' };
  }
};

const updateAmendment = async (facilityId, amendmentId, data, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);
    const isValidAmendmentId = isValidMongoId(amendmentId);

    if (!isValidFacilityId) {
      console.error('updateAmendment: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('updateAmendment: Invalid amendment id provided: %s', amendmentId);
      return { status: 400, data: 'Invalid amendment id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: generateHeaders(token),
      data,
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to create amendment request %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update amendment' };
  }
};

const getAmendmentInProgress = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getAmendmentInProgress: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/in-progress`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment in progress %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendment in progress' };
  }
};

const getAllAmendmentsInProgress = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/amendments/in-progress`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendments in progress %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get all amendments in progress' };
  }
};

const getCompletedAmendment = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getCompletedAmendment: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the completed amendment %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get completed amendment' };
  }
};

const getLatestCompletedAmendmentValue = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getLatestCompletedAmendmentValue: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-value`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed value amendment %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment value' };
  }
};

const getLatestCompletedAmendmentDate = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getLatestCompletedAmendmentDate: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-cover-end-date`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed coverEndDate amendment %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment date' };
  }
};

const getAmendmentById = async (facilityId, amendmentId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);
    const isValidAmendmentId = isValidMongoId(amendmentId);

    if (!isValidFacilityId) {
      console.error('getAmendmentById: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('getAmendmentById: Invalid amendment id provided: %s', amendmentId);
      return { status: 400, data: 'Invalid amendment id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendment by id' };
  }
};

const getAmendmentsByFacilityId = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getAmendmentsByFacilityId: Invalid facility id provided: %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments by facility id' };
  }
};

const getAmendmentsByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getAmendmentsByDealId: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by deal Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments by dealId' };
  }
};

const getAmendmentInProgressByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getAmendmentInProgressByDealId: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/in-progress`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment in progress by deal Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments in progress by dealId' };
  }
};

const getCompletedAmendmentByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getCompletedAmendmentByDealId: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the completed amendment by deal Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get completed amendment by dealId' };
  }
};

const getLatestCompletedAmendmentByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getLatestCompletedAmendmentByDealId: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed/latest`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed amendment by deal Id %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment by dealId' };
  }
};

const getParty = async (partyUrn, token) => {
  try {
    const isValidUrn = isValidPartyUrn(partyUrn);

    if (!isValidUrn) {
      console.error('getParty: Invalid party urn provided: %s', partyUrn);
      return { status: 400, data: 'Invalid party urn' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/party/urn/${partyUrn}`,
      headers: generateHeaders(token),
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Unable to get party %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to get party' };
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
  getAmendmentById,
  getAmendmentsByFacilityId,
  getAmendmentsByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
  getAllAmendmentsInProgress,
  getLatestCompletedAmendmentValue,
  getLatestCompletedAmendmentDate,
  getParty,
};
