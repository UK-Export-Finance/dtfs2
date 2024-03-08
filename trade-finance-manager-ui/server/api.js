const axios = require('axios');
const { isValidMongoId, isValidPartyUrn, isValidGroupId, isValidTaskId } = require('./helpers/validateIds');
const { assertValidIsoMonth } = require('./helpers/date');

require('dotenv').config();

const { TFM_API_URL, TFM_API_KEY } = process.env;

const generateHeaders = (token) => ({
  Authorization: token,
  'Content-Type': 'application/json',
  'x-api-key': TFM_API_KEY,
});

const getDeal = async (id, token, tasksFilters = {}, activityFilters = {}) => {
  const { filterType: tasksFilterType, teamId: tasksTeamId, userId: tasksUserId } = tasksFilters;
  const { filterType: activityFilterType } = activityFilters;
  const queryParams = {
    tasksFilterType,
    tasksTeamId,
    tasksUserId,
    activityFilterType,
  };

  const isValidDealId = isValidMongoId(id);

  if (!isValidDealId) {
    console.error('getDeal: Invalid deal id provided: %o', id);
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
        count: response.data.count,
      };
    }
    return {
      deals: [],
      count: 0,
    };
  } catch (error) {
    console.error('Unable to get deals %o', error);
    return {};
  }
};

const getFacility = async (id, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('getFacility: Invalid facility id provided: %o', id);
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
    console.error('Error getting team members %o', error);
    return fallbackTeamMembers;
  }
};

const updateParty = async (id, partyUpdate, token) => {
  try {
    const isValidDealId = isValidMongoId(id);

    if (!isValidDealId) {
      console.error('updateParty: Invalid deal id provided: %o', id);
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
    console.error('Unable to update party %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to update party' };
  }
};

const updateFacility = async (id, facilityUpdate, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('updateFacility: Invalid facility id provided: %o', id);
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
    console.error('Unable to update facility %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to update facility' };
  }
};

const updateFacilityRiskProfile = async (id, facilityUpdate, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('updateFacilityRiskProfile: Invalid facility id provided: %o', id);
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
    console.error('Unable to update facility risk profile %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to update facility risk profile' };
  }
};

const updateTask = async (dealId, groupId, taskId, taskUpdate, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateTask: Invalid deal id provided: %o', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    if (!isValidGroupId(groupId)) {
      console.error('updateTask: Invalid group id provided: %o', groupId);
      return { status: 400, data: 'Invalid group id' };
    }

    if (!isValidTaskId(taskId)) {
      console.error('updateTask: Invalid task id provided: %o', taskId);
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
    console.error('Unable to update task %o', error);
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
      console.error('updateCreditRating: Invalid deal id provided: %o', dealId);
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
    console.error('Unable to update credit rating request %o', error);
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
      console.error('updateLossGivenDefault: Invalid deal id provided: %o', dealId);
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
    console.error('Unable to update loss given default request %o', error);
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
      console.error('updateProbabilityOfDefault: Invalid deal id provided: %o', dealId);
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
    console.error('Unable to update probability of default request %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to update probability of default' };
  }
};

const updateUnderwriterManagersDecision = async (dealId, newUnderwriterManagersDecision, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateUnderwriterManagersDecision: Invalid deal id provided: %o', dealId);
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
    console.error("Unable to update underwriter manager's decision %o", error);
    return { status: error?.response?.status || 500, data: "Failed to update underwriter manager's decision" };
  }
};

const updateLeadUnderwriter = async ({ dealId, token, leadUnderwriterUpdate }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateLeadUnderwriter: Invalid deal id provided: %o', dealId);
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
    console.error('Unable to update lead underwriter %o', error);
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
      console.error('createActivity: Invalid deal id provided: %o', dealId);
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
    console.error('Unable to create activity request %o', error);
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

    return response.data;
  } catch (error) {
    console.error('Unable to log in %o', error?.response?.data);
    return { status: error?.response?.status || 500, data: 'Failed to login' };
  }
};

const updateUserPassword = async (userId, update, token) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('updateUserPassword: Invalid user id provided: %o', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeaders(token),
      data: update,
    }).catch((error) => {
      console.error('Unable to update user details in axios request %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to update user password' };
    });

    return response;
  } catch (error) {
    console.error('Unable to update user details %o', error);
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
      console.error('getUser: Invalid user id provided: %o', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeaders(token),
    });

    return response.data.user;
  } catch (error) {
    console.error('Unable to get the user details %o', error?.response?.data);
    return { status: error?.response?.status || 500, data: 'Failed to get user' };
  }
};

const createFacilityAmendment = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('createFacilityAmendment: Invalid facility id provided: %o', facilityId);
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
    console.error('Unable to create new amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to create facility amendment' };
  }
};

const updateAmendment = async (facilityId, amendmentId, data, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);
    const isValidAmendmentId = isValidMongoId(amendmentId);

    if (!isValidFacilityId) {
      console.error('updateAmendment: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('updateAmendment: Invalid amendment id provided: %o', amendmentId);
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
    console.error('Unable to create amendment request %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to update amendment' };
  }
};

const getAmendmentInProgress = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getAmendmentInProgress: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/in-progress`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment in progress %o', error);
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
    console.error('Unable to get the amendments in progress %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get all amendments in progress' };
  }
};

const getCompletedAmendment = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getCompletedAmendment: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the completed amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get completed amendment' };
  }
};

const getLatestCompletedAmendmentValue = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getLatestCompletedAmendmentValue: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-value`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed value amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment value' };
  }
};

const getLatestCompletedAmendmentDate = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getLatestCompletedAmendmentDate: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-cover-end-date`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed coverEndDate amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment date' };
  }
};

const getAmendmentById = async (facilityId, amendmentId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);
    const isValidAmendmentId = isValidMongoId(amendmentId);

    if (!isValidFacilityId) {
      console.error('getAmendmentById: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('getAmendmentById: Invalid amendment id provided: %o', amendmentId);
      return { status: 400, data: 'Invalid amendment id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendment by id' };
  }
};

const getAmendmentsByFacilityId = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getAmendmentsByFacilityId: Invalid facility id provided: %o', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments by facility id' };
  }
};

const getAmendmentsByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getAmendmentsByDealId: Invalid deal id provided: %o', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment by deal Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments by dealId' };
  }
};

const getAmendmentInProgressByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getAmendmentInProgressByDealId: Invalid deal id provided: %o', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/in-progress`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the amendment in progress by deal Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get amendments in progress by dealId' };
  }
};

const getCompletedAmendmentByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getCompletedAmendmentByDealId: Invalid deal id provided: %o', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the completed amendment by deal Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get completed amendment by dealId' };
  }
};

const getLatestCompletedAmendmentByDealId = async (dealId, token) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('getLatestCompletedAmendmentByDealId: Invalid deal id provided: %o', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed/latest`,
      headers: generateHeaders(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed amendment by deal Id %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment by dealId' };
  }
};

const getParty = async (partyUrn, token) => {
  try {
    const isValidUrn = isValidPartyUrn(partyUrn);

    if (!isValidUrn) {
      console.error('getParty: Invalid party urn provided: %o', partyUrn);
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
    console.error('Unable to get party %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get party' };
  }
};

/**
 * @param {string} token
 * @returns {Promise<import('./types/bank-holidays').BankHolidaysResponseBody>}
 */
const getUkBankHolidays = async (token) => {
  try {
    const { data } = await axios.get(`${TFM_API_URL}/v1/bank-holidays`, {
      headers: generateHeaders(token),
    });

    return data;
  } catch (error) {
    console.error('Failed to get UK bank holidays', error);
    throw error;
  }
};

/**
 * Fetches a summary of utilisation report reconciliation progress for the specified submission month for all banks.
 * @param {string} submissionMonth - the month that relevant reports are due to be submitted, in ISO format 'yyyy-MM'.
 * @param {string} userToken - token to validate session
 * @returns {Promise<import('./types/utilisation-reports').UtilisationReportReconciliationSummary[]>}
 */
const getUtilisationReportsReconciliationSummary = async (submissionMonth, userToken) => {
  try {
    assertValidIsoMonth(submissionMonth);

    const { data } = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`, {
      headers: generateHeaders(userToken),
    });

    return data;
  } catch (error) {
    console.error('Failed to get utilisation report reconciliation summary', error);
    throw error;
  }
};

/**
 * @typedef {import('stream').Readable} Readable
 * @typedef {{ ['content-disposition']: string, ['content-type']: string }} DownloadUtilisationReportResponseHeaders
 */

/**
 * @param {string} userToken
 * @param {string} _id
 * @returns {Promise<{ data: Readable, headers: DownloadUtilisationReportResponseHeaders }>}
 */
const downloadUtilisationReport = async (userToken, _id) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${_id}/download`, {
    responseType: 'stream',
    headers: generateHeaders(userToken),
  });

  return {
    data: response.data,
    headers: response.headers,
  };
};

/**
 * @param {import('./types/tfm-session-user').TfmSessionUser} user - the session user
 * @param {import('./types/utilisation-reports').ReportWithStatus[]} reportsWithStatus - array of reports with the status to set
 * @param {string} userToken - token to validate session
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const updateUtilisationReportStatus = async (user, reportsWithStatus, userToken) =>
  await axios({
    method: 'put',
    url: `${TFM_API_URL}/v1/utilisation-reports/set-status`,
    headers: generateHeaders(userToken),
    data: {
      user,
      reportsWithStatus,
    },
  });

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
  getUkBankHolidays,
  getUtilisationReportsReconciliationSummary,
  downloadUtilisationReport,
  updateUtilisationReportStatus,
};
