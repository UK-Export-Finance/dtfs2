const { HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA } = require('@ukef/dtfs2-common/schemas');
const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
const { isValidMongoId, isValidPartyUrn, isValidGroupId, isValidTaskId, isValidBankId } = require('./helpers/validateIds');
const { assertValidIsoMonth, assertValidIsoYear } = require('./helpers/date');
const PageOutOfBoundsError = require('./errors/page-out-of-bounds.error');

require('dotenv').config();

const { TFM_API_URL, TFM_API_KEY } = process.env;

const generateHeaders = () => ({
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': TFM_API_KEY,
});

const generateHeadersWithToken = (token) => ({
  Authorization: token,
  ...generateHeaders(),
});

/**
 * @param {string} id - deal id
 * @param {string} token - logged in user token
 * @param {import('@ukef/dtfs2-common').AnyObject} tasksFilters - tasks filters
 * @param {import('@ukef/dtfs2-common').AnyObject} activityFilters - activity filters
 * @returns {Promise<import('./types/data-transfer-objects/get-deal-response').GetDealResponse | { status: 400; data: 'Invalid deal id'}>}
 */
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
    console.error('getDeal: Invalid deal id provided %s', id);
    return { status: 400, data: 'Invalid deal id' };
  }

  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${id}`,
      headers: generateHeadersWithToken(token),
      params: queryParams,
    });
    return response?.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

/**
 * Makes a request to the GET /facilities TFM API endpoint
 * and throws an error if the page number is out of bounds
 * @param {Object} queryParams Query parameters
 * @param {string} token Authorisation token
 * @returns {Object} Facilities data and pagination metadata
 * @throws {PageOutOfBoundsError} Will throw if the requested page number exceeds the maximum page number
 */
const getFacilities = async (queryParams, token) => {
  const response = await axios({
    method: 'get',
    url: `${TFM_API_URL}/v1/facilities`,
    headers: generateHeadersWithToken(token),
    params: queryParams,
  });
  const { facilities, pagination } = response.data;

  if (queryParams.page >= pagination.totalPages) {
    throw new PageOutOfBoundsError('Requested page number exceeds the maximum page number');
  }

  return {
    facilities,
    pagination,
  };
};

/**
 * Makes a request to the GET /deals TFM API endpoint
 * and throws an error if the page number is out of bounds
 * @param {Object} queryParams Query parameters
 * @param {string} token Authorisation token
 * @returns {Object} Deals data and pagination metadata
 * @throws {PageOutOfBoundsError} Will throw if the requested page number exceeds the maximum page number
 */
const getDeals = async (queryParams, token) => {
  const response = await axios({
    method: 'get',
    url: `${TFM_API_URL}/v1/deals`,
    headers: generateHeadersWithToken(token),
    params: queryParams,
  });
  const { deals, pagination } = response.data;

  if (queryParams.page >= pagination?.totalPages) {
    throw new PageOutOfBoundsError('Requested page number exceeds the maximum page number');
  }

  return {
    deals,
    pagination,
  };
};

const getFacility = async (id, token) => {
  try {
    const isValidFacilityId = isValidMongoId(id);

    if (!isValidFacilityId) {
      console.error('getFacility: Invalid facility id provided %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeadersWithToken(token),
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
      headers: generateHeadersWithToken(token),
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
      console.error('updateParty: Invalid deal id provided %s', id);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/parties/${id}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateFacility: Invalid facility id provided %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateFacilityRiskProfile: Invalid facility id provided %s', id);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${id}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateTask: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    if (!isValidGroupId(groupId)) {
      console.error('updateTask: Invalid group id provided %s', groupId);
      return { status: 400, data: 'Invalid group id' };
    }

    if (!isValidTaskId(taskId)) {
      console.error('updateTask: Invalid task id provided %s', taskId);
      return { status: 400, data: 'Invalid task id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/tasks/${groupId}/${taskId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateCreditRating: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateLossGivenDefault: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateProbabilityOfDefault: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateUnderwriterManagersDecision: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }
    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/underwriting/managers-decision`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateLeadUnderwriter: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/underwriting/lead-underwriter`,
      headers: generateHeadersWithToken(token),
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
      console.error('createActivity: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}`,
      headers: generateHeadersWithToken(token),
      data: dealUpdate,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to create activity request %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to create activity' };
  }
};

// TODO DTFS2-7772 - remove this function
const login = async (username, password) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${TFM_API_URL}/v1/login`,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
      data: { username, password },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to log in %o', error?.response?.data);
    return { status: error?.response?.status || 500, data: 'Failed to login' };
  }
};

/**
 * Handles the SSO redirect form request by sending a POST request to the TFM API.
 *
 * @param {('@ukef/dtfs2-common').HandleSsoRedirectFormRequest} handleSsoRedirectFormRequest - The request payload.
 * @returns {Promise<import('@ukef/dtfs2-common').HandleSsoRedirectFormResponse>} A promise resolving to the response object.
 */
const handleSsoRedirectForm = async (handleSsoRedirectFormRequest) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/sso/handle-sso-redirect-form`,
    headers: {
      ...generateHeaders(),
    },
    data: handleSsoRedirectFormRequest,
  });

  return HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA.parse(response.data);
};

/**
 * Gets the auth code URL for the SSO login process
 * @param {import('@ukef/dtfs2-common').GetAuthCodeUrlRequest} getAuthCodeUrlParams
 * @returns {Promise<import('@ukef/dtfs2-common').GetAuthCodeUrlResponse>}
 */
const getAuthCodeUrl = async ({ successRedirect }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/sso/auth-code-url`,
      headers: {
        ...generateHeaders(),
      },
      params: { successRedirect },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get auth code url %o', error?.response?.data);
    throw error;
  }
};

const updateUserPassword = async (userId, update, token) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('updateUserPassword: Invalid user id provided %s', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeadersWithToken(token),
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
    headers: generateHeadersWithToken(token),
    data: formData,
  });
  return response.data;
};

const getUser = async (userId, token) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('getUser: Invalid user id provided %s', userId);
      return { status: 400, data: 'Invalid user id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/users/${userId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('createFacilityAmendment: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'post',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments`,
      headers: generateHeadersWithToken(token),
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
      console.error('updateAmendment: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('updateAmendment: Invalid amendment id provided %s', amendmentId);
      return { status: 400, data: 'Invalid amendment id' };
    }

    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('getAmendmentInProgress: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/in-progress`,
      headers: generateHeadersWithToken(token),
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
      headers: generateHeadersWithToken(token),
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
      console.error('getCompletedAmendment: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed`,
      headers: generateHeadersWithToken(token),
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
      console.error('getLatestCompletedAmendmentValue: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-value`,
      headers: generateHeadersWithToken(token),
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
      console.error('getLatestCompletedAmendmentDate: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-cover-end-date`,
      headers: generateHeadersWithToken(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed coverEndDate amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed amendment date' };
  }
};

/**
 * @param {string} facilityId - The facility ID
 * @param {string} token - The user token
 * @returns {Promise<import('./api-response-types').GetLatestCompletedAmendmentFacilityEndDateResponse>}
 */
const getLatestCompletedAmendmentFacilityEndDate = async (facilityId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('getLatestCompletedAmendmentFacilityEndDate: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/completed/latest-facility-end-date`,
      headers: generateHeadersWithToken(token),
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest completed facility end date amendment %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest completed facility end date amendment' };
  }
};

const getAmendmentById = async (facilityId, amendmentId, token) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);
    const isValidAmendmentId = isValidMongoId(amendmentId);

    if (!isValidFacilityId) {
      console.error('getAmendmentById: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    if (!isValidAmendmentId) {
      console.error('getAmendmentById: Invalid amendment id provided %s', amendmentId);
      return { status: 400, data: 'Invalid amendment id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: generateHeadersWithToken(token),
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
      console.error('getAmendmentsByFacilityId: Invalid facility id provided %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/facilities/${facilityId}/amendments`,
      headers: generateHeadersWithToken(token),
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
      console.error('getAmendmentsByDealId: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments`,
      headers: generateHeadersWithToken(token),
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
      console.error('getAmendmentInProgressByDealId: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/in-progress`,
      headers: generateHeadersWithToken(token),
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
      console.error('getCompletedAmendmentByDealId: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed`,
      headers: generateHeadersWithToken(token),
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
      console.error('getLatestCompletedAmendmentByDealId: Invalid deal id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/amendments/completed/latest`,
      headers: generateHeadersWithToken(token),
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
      console.error('getParty: Invalid party urn provided %s', partyUrn);
      return { status: 400, data: 'Invalid party urn' };
    }

    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/party/urn/${partyUrn}`,
      headers: generateHeadersWithToken(token),
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
      headers: generateHeadersWithToken(token),
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
      headers: generateHeadersWithToken(userToken),
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
 * @param {string} id
 * @returns {Promise<{ data: Readable, headers: DownloadUtilisationReportResponseHeaders }>}
 */
const downloadUtilisationReport = async (userToken, id) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${id}/download`, {
    responseType: 'stream',
    headers: generateHeadersWithToken(userToken),
  });

  return {
    data: response.data,
    headers: response.headers,
  };
};

/**
 * @param {string} reportId - The report id
 * @param {import('@ukef/dtfs2-common').PremiumPaymentsFilters} premiumPaymentsFilters - Filters to apply to the premium payments tab
 * @param {import('@ukef/dtfs2-common').PaymentDetailsFilters} paymentDetailsFilters - Filters to apply to the payment details tab
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').UtilisationReportReconciliationDetailsResponseBody>}
 */
const getUtilisationReportReconciliationDetailsById = async (reportId, premiumPaymentsFilters, paymentDetailsFilters, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/reconciliation-details/${reportId}`, {
    headers: generateHeadersWithToken(userToken),
    params: { premiumPaymentsFilters, paymentDetailsFilters },
  });

  return response.data;
};

/**
 * Gets the selected fee records details with the attached available payment
 * groups.
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the selected fee records
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').SelectedFeeRecordsDetailsResponseBody>}
 */
const getSelectedFeeRecordsDetailsWithAvailablePaymentGroups = async (reportId, feeRecordIds, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/selected-fee-records-details`, {
    headers: generateHeadersWithToken(userToken),
    params: {
      includeAvailablePaymentGroups: true,
    },
    data: {
      feeRecordIds,
    },
  });

  return response.data;
};

/**
 * Gets the selected fee records details without the attached available payment
 * groups.
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the selected fee records
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').SelectedFeeRecordsDetailsResponseBody>}
 */
const getSelectedFeeRecordsDetailsWithoutAvailablePaymentGroups = async (reportId, feeRecordIds, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/selected-fee-records-details`, {
    headers: generateHeadersWithToken(userToken),
    params: {
      includeAvailablePaymentGroups: false,
    },
    data: {
      feeRecordIds,
    },
  });

  return response.data;
};

/**
 * Fetches all banks
 * @param {string} userToken - token to validate session
 * @returns {Promise<import('./types/banks').Bank[]>}
 */
const getAllBanks = async (userToken) => {
  try {
    const { data } = await axios.get(`${TFM_API_URL}/v1/banks`, {
      headers: generateHeadersWithToken(userToken),
    });

    return data;
  } catch (error) {
    console.error('Failed to get banks', error);
    throw error;
  }
};

/**
 * Fetches all banks with their available report years
 * @param {string} userToken - token to validate session
 * @returns {Promise<import('./api-response-types').BankWithReportingYearsResponseBody[]>}
 */
const getAllBanksWithReportingYears = async (userToken) => {
  try {
    const { data } = await axios.get(`${TFM_API_URL}/v1/banks?includeReportingYears=true`, {
      headers: generateHeadersWithToken(userToken),
    });

    return data;
  } catch (error) {
    console.error('Failed to get banks with reporting years', error);
    throw error;
  }
};

/**
 * Fetches all submitted reports by bank ID and year
 * @param {string} userToken - token to validate session
 * @param {string} bankId - the bank ID
 * @param {string} year - the year
 * @returns {Promise<import('./types/utilisation-reports').UtilisationReportSearchSummary>}
 */
const getReportSummariesByBankAndYear = async (userToken, bankId, year) => {
  try {
    isValidBankId(bankId);
    assertValidIsoYear(year);

    const { data } = await axios.get(`${TFM_API_URL}/v1/bank/${bankId}/utilisation-reports/reconciliation-summary-by-year/${year}`, {
      headers: generateHeadersWithToken(userToken),
    });

    return data;
  } catch (error) {
    console.error('Failed to get utilisation report summaries by bank ID and year', error);
    throw error;
  }
};

/**
 * Adds a payment to the supplied fee records
 * @param {string} reportId - The report id
 * @param {import('./types/add-payment-form-values').ParsedAddPaymentFormValues} parsedAddPaymentFormValues - The parsed submitted form values
 * @param {number[]} feeRecordIds - The list of fee record ids to add the payment to
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user adding the payment
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').AddPaymentResponseBody>}
 */
const addPaymentToFeeRecords = async (reportId, parsedAddPaymentFormValues, feeRecordIds, user, userToken) => {
  const { paymentCurrency, paymentAmount, datePaymentReceived, paymentReference } = parsedAddPaymentFormValues;

  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment`,
    headers: generateHeadersWithToken(userToken),
    data: {
      feeRecordIds,
      paymentCurrency,
      paymentAmount,
      datePaymentReceived,
      paymentReference,
      user,
    },
  });
  return response.data;
};

/**
 * Create a record correction
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').PostFeeRecordCorrectionResponseBody>}
 */
const createFeeRecordCorrection = async (reportId, feeRecordId, user, userToken) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/corrections`,
    headers: generateHeadersWithToken(userToken),
    data: {
      user,
    },
  });
  return response.data;
};

/**
 * Generates keying data for the utilisation report
 * with the supplied id
 * @param {string} reportId - The report id
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<{}>}
 */
const generateKeyingData = async (reportId, user, userToken) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/keying-data`,
    headers: generateHeadersWithToken(userToken),
    data: {
      user,
    },
  });
  return response.data;
};

/**
 * Updates keying sheet fee records with supplied ids to DONE
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the fee records to mark as DONE
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<{}>}
 */
const markKeyingDataAsDone = async (reportId, feeRecordIds, user, userToken) => {
  const response = await axios({
    method: 'put',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/keying-data/mark-as-done`,
    headers: generateHeadersWithToken(userToken),
    data: {
      user,
      feeRecordIds,
    },
  });
  return response.data;
};

/**
 * Updates keying sheet fee records with supplied ids to TO_DO
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the fee records to mark as TO_DO
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<{}>}
 */
const markKeyingDataAsToDo = async (reportId, feeRecordIds, user, userToken) => {
  const response = await axios({
    method: 'put',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/keying-data/mark-as-to-do`,
    headers: generateHeadersWithToken(userToken),
    data: {
      user,
      feeRecordIds,
    },
  });
  return response.data;
};

/**
 * Gets the utilisation report with the fee
 * records to key
 * @param {string} reportId - The report id
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').FeeRecordsToKeyResponseBody>}
 */
const getUtilisationReportWithFeeRecordsToKey = async (reportId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records-to-key`, {
    headers: generateHeadersWithToken(userToken),
  });
  return response.data;
};

/**
 * Gets the payment details with the attached fee records
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').GetPaymentDetailsWithFeeRecordsResponseBody>}
 */
const getPaymentDetailsWithFeeRecords = async (reportId, paymentId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`, {
    headers: generateHeadersWithToken(userToken),
    params: {
      includeFeeRecords: true,
    },
  });
  return response.data;
};

/**
 * Gets the payment details without the attached fee records
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').GetPaymentDetailsWithoutFeeRecordsResponseBody>}
 */
const getPaymentDetailsWithoutFeeRecords = async (reportId, paymentId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`, {
    headers: generateHeadersWithToken(userToken),
    params: {
      includeFeeRecords: false,
    },
  });
  return response.data;
};

/**
 * Deletes the payment with the specified id
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 */
const deletePaymentById = async (reportId, paymentId, user, userToken) => {
  await axios({
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`,
    method: 'delete',
    headers: generateHeadersWithToken(userToken),
    data: { user },
  });
};

/**
 * Updated the payment with the supplied edit payment form values
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {import('./types/edit-payment-form-values').ParsedEditPaymentFormValues} parsedEditPaymentFormValues - The parsed edit payment form values
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
 * @param {string} userToken - The user token
 */
const editPayment = async (reportId, paymentId, parsedEditPaymentFormValues, user, userToken) => {
  const { paymentAmount, datePaymentReceived, paymentReference } = parsedEditPaymentFormValues;
  await axios({
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`,
    method: 'patch',
    headers: generateHeadersWithToken(userToken),
    data: {
      paymentAmount,
      datePaymentReceived,
      paymentReference,
      user,
    },
  });
};

/**
 * Removes the supplied fee records from a supplied payment
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {number[]} selectedFeeRecordIds - The list of fee record ids to remove from the payment
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
 * @param {string} userToken - The user token
 */
const removeFeesFromPayment = async (reportId, paymentId, selectedFeeRecordIds, user, userToken) => {
  await axios({
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}/remove-selected-fees`,
    method: 'post',
    headers: generateHeadersWithToken(userToken),
    data: {
      selectedFeeRecordIds,
      user,
    },
  });
};

/**
 * Adds the supplied fee records to an existing payment
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The list of fee record ids to add to the payment
 * @param {number[]} paymentIds - The list of payment ids for the fee records to be added to
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user adding the payment
 * @param {string} userToken - The user token
 */
const addFeesToAnExistingPayment = async (reportId, feeRecordIds, paymentIds, user, userToken) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/add-to-an-existing-payment`,
    headers: generateHeadersWithToken(userToken),
    data: {
      feeRecordIds,
      paymentIds,
      user,
    },
  });
  return response.data;
};

/**
 * Updates the deal cancellation object on a TFM MIN or AIN deal
 * @param {string} dealId - The deal ID
 * @param {Partial<import('@ukef/dtfs2-common').TfmDealCancellation>} cancellationUpdate - The deal cancellation update object
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 */
const updateDealCancellation = async (dealId, cancellationUpdate, userToken) => {
  try {
    await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/${dealId}/cancellation`,
      headers: generateHeadersWithToken(userToken),
      data: cancellationUpdate,
    });
  } catch (error) {
    console.error('Failed to update deal cancellation', error);
    throw error;
  }
};

/**
 * Gets the deal cancellation object on a TFM MIN or AIN deal
 * @param {string} dealId - The deal ID
 * @param {string} userToken - The user token
 * @returns {Promise<Partial<import('@ukef/dtfs2-common').TfmDealCancellationWithStatus>>}
 */
const getDealCancellation = async (dealId, userToken) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${TFM_API_URL}/v1/deals/${dealId}/cancellation`,
      headers: generateHeadersWithToken(userToken),
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get deal cancellation', error);
    throw error;
  }
};

/**
 * Deletes the deal cancellation object on a TFM MIN or AIN deal
 * @param {string} dealId - The deal ID
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 */
const deleteDealCancellation = async (dealId, userToken) => {
  try {
    await axios({
      method: 'delete',
      url: `${TFM_API_URL}/v1/deals/${dealId}/cancellation`,
      headers: generateHeadersWithToken(userToken),
    });
  } catch (error) {
    console.error('Failed to get deal cancellation', error);
    throw error;
  }
};

/**
 * Submits the deal cancellation object on a TFM MIN or AIN deal
 * @param {string} dealId - The deal ID
 * @param {import('@ukef/dtfs2-common').TfmDealCancellation} cancellation - The deal cancellation object
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 */
const submitDealCancellation = async (dealId, cancellation, userToken) => {
  try {
    await axios({
      method: 'post',
      url: `${TFM_API_URL}/v1/deals/${dealId}/cancellation/submit`,
      headers: generateHeadersWithToken(userToken),
      data: cancellation,
    });
  } catch (error) {
    console.error('Failed to submit deal cancellation', error);
    throw error;
  }
};

/**
 * Gets the fee record
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').GetFeeRecordResponseBody>}
 */
const getFeeRecord = async (reportId, feeRecordId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}`, {
    headers: generateHeadersWithToken(userToken),
  });
  return response.data;
};

/**
 * Gets the fee record correction request review
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {string} userId - The id of the user requesting the correction
 * @param {string} userToken - The user token
 * @returns {Promise<import('./api-response-types').FeeRecordCorrectionRequestReviewResponseBody>}
 */
const getFeeRecordCorrectionRequestReview = async (reportId, feeRecordId, userId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-request-review/${userId}`, {
    headers: generateHeadersWithToken(userToken),
  });
  return response.data;
};

/**
 * Updates the fee record correction transient form data associated with the user
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('@ukef/dtfs2-common').RecordCorrectionRequestTransientFormData} formData - The transient form data
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails
 */
const updateFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, formData, user, userToken) => {
  try {
    await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-transient-form-data`,
      headers: generateHeadersWithToken(userToken),
      data: {
        formData,
        user,
      },
    });
  } catch (error) {
    console.error('Failed to update fee record correction transient form data', error);
    throw error;
  }
};

/**
 * Gets the fee record by report id, fee record id and user
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<import('@ukef/dtfs2-common').RecordCorrectionRequestTransientFormData | {}>}
 */
const getFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, user, userToken) => {
  try {
    const userId = user._id;

    const { data } = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-transient-form-data/${userId}`, {
      headers: generateHeadersWithToken(userToken),
    });

    return data;
  } catch (error) {
    console.error('Failed to get fee record correction transient form data', error);
    throw error;
  }
};

/**
 * Deletes the fee record by report id, fee record id and user
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
 * @param {string} userToken - The user token
 * @returns {Promise<void>}
 */
const deleteFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, user, userToken) => {
  try {
    const userId = user._id;

    await axios({
      method: 'delete',
      url: `${TFM_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-transient-form-data/${userId}`,
      headers: generateHeadersWithToken(userToken),
    });
  } catch (error) {
    console.error('Failed to delete fee record correction transient form data %o', error);
    throw error;
  }
};

/**
 * Gets the record correction log details by id
 * @param {string} correctionId - The correction id
 * @param {string} userToken - The user token
 * @returns {Promise<import('@ukef/dtfs2-common').GetRecordCorrectionLogDetailsResponseBody>}
 */
const getRecordCorrectionLogDetailsById = async (correctionId, userToken) => {
  const response = await axios.get(`${TFM_API_URL}/v1/utilisation-reports/record-correction-log-details/${correctionId}`, {
    headers: generateHeadersWithToken(userToken),
  });

  return response.data;
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
  handleSsoRedirectForm,
  getAuthCodeUrl,
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
  getLatestCompletedAmendmentFacilityEndDate,
  getParty,
  getUkBankHolidays,
  getUtilisationReportsReconciliationSummary,
  downloadUtilisationReport,
  getUtilisationReportReconciliationDetailsById,
  getAllBanks,
  getAllBanksWithReportingYears,
  getSelectedFeeRecordsDetailsWithAvailablePaymentGroups,
  getSelectedFeeRecordsDetailsWithoutAvailablePaymentGroups,
  getReportSummariesByBankAndYear,
  addPaymentToFeeRecords,
  createFeeRecordCorrection,
  generateKeyingData,
  markKeyingDataAsDone,
  markKeyingDataAsToDo,
  getUtilisationReportWithFeeRecordsToKey,
  getPaymentDetailsWithFeeRecords,
  getPaymentDetailsWithoutFeeRecords,
  deletePaymentById,
  editPayment,
  removeFeesFromPayment,
  addFeesToAnExistingPayment,
  updateDealCancellation,
  getDealCancellation,
  deleteDealCancellation,
  submitDealCancellation,
  getFeeRecord,
  getFeeRecordCorrectionRequestReview,
  updateFeeRecordCorrectionTransientFormData,
  getFeeRecordCorrectionTransientFormData,
  deleteFeeRecordCorrectionTransientFormData,
  getRecordCorrectionLogDetailsById,
};
