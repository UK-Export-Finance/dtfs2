const axios = require('axios');
const { isValidMongoId, isValidPartyUrn, isValidGroupId, isValidTaskId } = require('./helpers/validateIds');

require('dotenv').config();

const { TFM_API_URL, TFM_API_KEY } = process.env;

const generateHeaders = (token) => ({
  Authorization: token,
  'Content-Type': 'application/json',
  'x-api-key': TFM_API_KEY,
});

const getDeal = async (id, token, tasksFilters = {}, activityFilters = {}) => {
  const {
    filterType: tasksFilterType,
    teamId: tasksTeamId,
    userId: tasksUserId,
  } = tasksFilters;
  const {
    filterType: activityFilterType,
  } = activityFilters;
  const queryParams = {
    tasksFilterType,
    tasksTeamId,
    tasksUserId,
    activityFilterType,
  };

  const isValidDealId = isValidMongoId(id);

  if (!isValidDealId) {
    console.error('getDeal: Invalid deal id provided: %s', id);
    return { status: 400, data: 'Invalid deal id' };
  }

  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${id}`,
      headers: generateHeaders(token),
      params: queryParams,
    });
    return response?.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getFacilities = async (token, searchString = '') => {
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities`,
      headers: generateHeaders(token),
      params: { searchString },
    });
    if (response.data) {
      return {
        facilities: response.data.tfmFacilities,
      };
    }
    return { facilities: [] };
  } catch (error) {
    console.error(error);
    return { facilities: [] };
  }
};

/**
 * Makes a request to the GET /deals TFM API endpoint
 * @param {Object} queryParams Query parameters
 * @param {string} token Authorisation token
 * @returns {Object} Deals data and pagination metadata
 */
const getDeals = async (queryParams, token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals`,
      headers: generateHeaders(token),
      params: queryParams,
    });
    if (response.data) {
      return {
        deals: response.data.deals,
        pagination: response.data.pagination,
      };
    }
    return {
      deals: [],
      pagination: {
        totalItems: 0,
        currentPage: queryParams.page,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error('Unable to get deals %O', error);
    return {};
  }
};

const getFacility = async (id, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('getFacility: Invalid facility id provided: %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeaders(token),
    });
    return response.data.facility;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getTeamMembers = async (teamId, token) => {
  const fallbackTeamMembers = [];
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/teams/${teamId}/members`,
      headers: generateHeaders(token),
    });
    return response?.data?.teamMembers ? response?.data?.teamMembers : fallbackTeamMembers;
  } catch (error) {
    console.error('Error getting team members %s', error);
    return fallbackTeamMembers;
  }
};

const updateParty = async (id, partyUpdate, token) => {
  try {
    const isValidDealId = isValidMongoId(id);

    if (!isValidDealId) {
      console.error('updateParty: Invalid deal id provided: %s', id);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/parties/${id}`,
      headers: generateHeaders(token),
      data: partyUpdate,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to update party %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update party' };
  }
};

const updateFacility = async (id, facilityUpdate, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('updateFacility: Invalid facility id provided: %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeaders(token),
      data: facilityUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update facility %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update facility' };
  }
};

const updateFacilityRiskProfile = async (id, facilityUpdate, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('updateFacilityRiskProfile: Invalid facility id provided: %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeaders(token),
      data: facilityUpdate,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to update facility risk profile %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update facility risk profile' };
  }
};

const updateTask = async (dealId, groupId, taskId, taskUpdate, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateTask: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    if (!isValidGroupId(groupId)) {
      console.error('updateTask: Invalid group id provided: %s', groupId);
      return { status: 400, data: 'Invalid group id' };
    }

    if (!isValidTaskId(taskId)) {
      console.error('updateTask: Invalid task id provided: %s', taskId);
      return { status: 400, data: 'Invalid task id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/tasks/${groupId}/${taskId}`,
      headers: generateHeaders(token),
      data: taskUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update task %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update task' };
  }
};

const updateCreditRating = async (dealId, creditRatingUpdate, token) => {
  const { exporterCreditRating } = creditRatingUpdate;
  const dealUpdate = {
    tfm: {
      exporterCreditRating,
    },
  };
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateCreditRating: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeaders(token),
      data: dealUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update credit rating request %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update credit rating' };
  }
};

const updateLossGivenDefault = async (dealId, lossGivenDefaultUpdate, token) => {
  const { lossGivenDefault } = lossGivenDefaultUpdate;
  const dealUpdate = {
    tfm: {
      lossGivenDefault,
    },
  };
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateLossGivenDefault: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeaders(token),
      data: dealUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update loss given default request %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update loss given default' };
  }
};

const updateProbabilityOfDefault = async (dealId, probabilityOfDefaultUpdate, token) => {
  const { probabilityOfDefault } = probabilityOfDefaultUpdate;
  const dealUpdate = {
    tfm: {
      probabilityOfDefault,
    },
  };
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateProbabilityOfDefault: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeaders(token),
      data: dealUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update probability of default request %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update probability of default' };
  }
};

const updateUnderwriterManagersDecision = async (dealId, newUnderwriterManagersDecision, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateUnderwriterManagersDecision: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }
    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/underwriting/managers-decision`,
      headers: generateHeaders(token),
      data: newUnderwriterManagersDecision,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update underwriter manager\'s decision %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update underwriter manager\'s decision' };
  }
};

const updateLeadUnderwriter = async ({ dealId, token, leadUnderwriterUpdate }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateLeadUnderwriter: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/underwriting/lead-underwriter`,
      headers: generateHeaders(token),
      data: leadUnderwriterUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update lead underwriter %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to update lead underwriter' };
  }
};

const createActivity = async (dealId, activityUpdate, token) => {
  const dealUpdate = {
    tfm: {
      activities: activityUpdate,
    },
  };
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('createActivity: Invalid deal id provided: %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeaders(token),
      data: dealUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to create activity request %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to create activity' };
  }
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
    console.error('Unable to log in %s', error?.response?.data);
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
      console.error('Unable to update user details in axios request %s', error);
      return { status: error?.response?.status || 500, data: 'Failed to update user password' };
    });

    return response;
  } catch (error) {
    console.error('Unable to update user details %s', error);
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
    console.error('Unable to get the user details %s', error?.response?.data);
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
    console.error('Unable to create new amendment %s', error);
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
    console.error('Unable to create amendment request %s', error);
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
    console.error('Unable to get the amendment in progress %s', error);
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
    console.error('Unable to get the amendments in progress %s', error);
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
    console.error('Unable to get the completed amendment %s', error);
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
    console.error('Unable to get the latest completed value amendment %s', error);
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
    console.error('Unable to get the latest completed coverEndDate amendment %s', error);
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
    console.error('Unable to get the amendment by Id %s', error);
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
    console.error('Unable to get the amendment by Id %s', error);
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
    console.error('Unable to get the amendment by deal Id %s', error);
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
    console.error('Unable to get the amendment in progress by deal Id %s', error);
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
    console.error('Unable to get the completed amendment by deal Id %s', error);
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
    console.error('Unable to get the latest completed amendment by deal Id %s', error);
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
    console.error('Unable to get party %s', error);
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
