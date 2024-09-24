const axios = require('axios');
const { HEADERS, InvalidDealIdError } = require('@ukef/dtfs2-common');
const { hasValidUri } = require('./helpers/hasValidUri.helper');
const { isValidMongoId, isValidPartyUrn, isValidNumericId, isValidCurrencyCode, sanitizeUsername, isValidTeamId } = require('./validation/validateIds');
require('dotenv').config();

const { DTFS_CENTRAL_API_URL, EXTERNAL_API_URL, DTFS_CENTRAL_API_KEY, EXTERNAL_API_KEY, AZURE_ACBS_FUNCTION_URL } = process.env;

const headers = {
  central: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': DTFS_CENTRAL_API_KEY,
  },
  external: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': String(EXTERNAL_API_KEY),
  },
};

const findOnePortalDeal = async (dealId) => {
  try {
    const isValidDealId = isValidMongoId(dealId);
    if (!isValidDealId) {
      console.error('findOnePortalDeal: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
    });

    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalDeal = async (dealId, update, auditDetails) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updatePortalDeal: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
      data: {
        dealUpdate: update,
        auditDetails,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error('TFM API - error updating BSS deal %s', dealId);

    return false;
  }
};

const updatePortalBssDealStatus = async ({ dealId, status, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updatePortalBssDealStatus: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/status`,
      headers: headers.central,
      data: {
        status,
        auditDetails,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error('TFM API - error updating BSS deal status %s', dealId);

    return false;
  }
};

const addPortalDealComment = async (dealId, commentType, comment, auditDetails) => {
  const isValidDealId = isValidMongoId(dealId);

  if (!isValidDealId) {
    console.error('addPortalDealComment: Invalid deal id %s', dealId);
    throw new Error(`Invalid deal id: ${dealId}`);
  }

  const response = await axios({
    method: 'post',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/comment`,
    headers: headers.central,
    data: {
      dealId,
      commentType,
      comment,
      auditDetails,
    },
  });

  return response.data;
};

const updatePortalFacilityStatus = async (facilityId, status, auditDetails) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('updatePortalFacilityStatus: Invalid facility id %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/status`,
      headers: headers.central,
      data: {
        status,
        auditDetails,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error('TFM API - error updating BSS facility status %s', facilityId, response);

    return false;
  }
};

const updatePortalFacility = async (facilityId, update, auditDetails) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('updatePortalFacility: Invalid facility id %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
      data: { facilityUpdate: update, auditDetails },
    });

    return response.data;
  } catch ({ response }) {
    console.error('TFM API - error updating BSS facility %s', facilityId);

    return false;
  }
};

const findOneDeal = async (dealId) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('findOneDeal: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`,
      headers: headers.central,
    });
    return response.data.deal;
  } catch ({ response }) {
    console.error('Unable to find the deal %s', dealId);

    return false;
  }
};

/**
 * @param {object} params
 * @param {string} params.dealId - deal to update
 * @param {object} params.dealUpdate - update to make
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - user making the request
 * @typedef {object} ErrorParam
 * @property {string} message error message
 * @property {number} status HTTP status code
 * @param {(Error: ErrorParam) => any} params.onError
 * @returns updated deal on success, or `onError({ status, message })` on failure
 */
const updateDeal = async ({ dealId, dealUpdate, auditDetails, onError = ({ status, message }) => ({ status, data: message }) }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateDeal: Invalid deal id %s', dealId);
      return onError({ status: 400, message: 'Invalid deal id' });
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`,
      headers: headers.central,
      data: {
        dealUpdate,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('updateDeal: Failed to update deal %o', error);
    return onError({ status: error?.code || 500, message: 'Error when updating deal' });
  }
};

const updateDealSnapshot = async (dealId, snapshotUpdate, auditDetails) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateDealSnapshot: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/snapshot`,
      headers: headers.central,
      data: {
        snapshotUpdate,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('updateDealSnapshot: Failed to update deal snapshot %o', error);
    return { status: error?.code || 500, data: 'Failed to update deal snapshot' };
  }
};

const submitDeal = async (dealType, dealId, auditDetails) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/submit`,
      headers: headers.central,
      data: {
        dealType,
        dealId,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('submitDeal: Failed to submit deal %o', error);
    return { status: error?.code || 500, data: 'Error when submitting deal' };
  }
};

/**
 * Updates the deal cancellation object on a TFM AIN or MIN deal
 * @param {object} params
 * @param {string} params.dealId - deal cancellation to update
 * @param {Partial<import('@ukef/dtfs2-common').TfmDealCancellation>} params.dealCancellationUpdate - deal cancellation update to make
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - user making the request
 * @returns {Promise<import('mongodb').UpdateResult>} update result object
 */
const updateDealCancellation = async ({ dealId, dealCancellationUpdate, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      throw new InvalidDealIdError(dealId);
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/cancellation`,
      headers: headers.central,
      data: {
        dealCancellationUpdate,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Gets the deal cancellation object on a TFM deal
 * @param {string} dealId - deal cancellation to update
 * @returns {Promise<import('@ukef/dtfs2-common').TfmDealCancellation>} - Deal cancellation object
 */
const getDealCancellation = async (dealId) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      throw new InvalidDealIdError(dealId);
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/cancellation`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('findOneFacility: Invalid facility id %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('TFM API - error finding BSS facility %s', facilityId);
    return { status: error?.code || 500, data: 'Error finding BSS facility' };
  }
};

const findFacilitiesByDealId = async (dealId) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('findFacilitiesByDealId: Invalid deal id %s', dealId);
      return { status: 400, data: 'Invalid deal id' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/facilities`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('findFacilitiesByDealId: Failed to find facilities by deal id %o', error);
    return { status: error?.code || 500, data: 'Failed to find facilities by deal id' };
  }
};

const updateFacility = async ({ facilityId, tfmUpdate, auditDetails }) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('updateFacility: Invalid facility id %s', facilityId);
      return { status: 400, data: 'Invalid facility id' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}`,
      headers: headers.central,
      data: {
        tfmUpdate,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('updateFacility: Failed to update facility %o', error);
    return { status: error?.code || 500, data: 'Failed to update facility' };
  }
};

const createFacilityAmendment = async (facilityId, auditDetails) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'post',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments`,
        headers: headers.central,
        data: { auditDetails },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating facility amendment %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to create facility amendment' };
    }
  } else {
    console.error('Invalid facilityId provided');
    return { status: 400, data: 'Invalid facility id' };
  }
};

const updateFacilityAmendment = async (facilityId, amendmentId, payload, auditDetails) => {
  const isValid = isValidMongoId(facilityId) && isValidMongoId(amendmentId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'put',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`,
        headers: headers.central,
        data: {
          payload,
          auditDetails,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating facility amendment %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to update facility amendment' };
    }
  } else {
    console.error('Invalid facility Id or amendment Id provided');
    return { status: 400, data: 'Invalid facility Id or amendment Id provided' };
  }
};

const getAmendmentInProgress = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/in-progress`,
        headers: headers.central,
      });

      return { status: 200, data: response.data };
    } catch (error) {
      console.error('Unable to get the amendment in progress %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the amendment in progress' };
    }
  } else {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getCompletedAmendment = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/completed`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the completed amendment %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the completed amendment' };
    }
  } else {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getLatestCompletedAmendmentValue = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the latest completed value amendment %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the latest completed value amendment' };
    }
  } else {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getLatestCompletedAmendmentDate = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/completed/latest-cover-end-date`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the latest completed coverEndDate amendment %o', error);
      return {
        status: error?.response?.status || 500,
        data: 'Failed to get the latest completed coverEndDate amendment',
      };
    }
  } else {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getLatestCompletedAmendmentFacilityEndDate = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (!isValid) {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/completed/latest-facility-end-date`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get the latest completed facility end date amendment %o', error);
    return {
      status: error?.response?.status || 500,
      data: 'Failed to get the latest completed facility end date amendment',
    };
  }
};

const getAmendmentById = async (facilityId, amendmentId) => {
  const isValid = isValidMongoId(facilityId) && isValidMongoId(amendmentId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the amendment %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the amendment' };
    }
  } else {
    console.error('Invalid facility or amendment Id');
    return { status: 400, data: 'Invalid facility Id or amendment Id provided' };
  }
};

const getAmendmentByFacilityId = async (facilityId) => {
  const isValid = isValidMongoId(facilityId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}/amendments`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the amendment by facility Id %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the amendment by facilityId' };
    }
  } else {
    console.error('Invalid facility Id %s', facilityId);
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getAmendmentsByDealId = async (dealId) => {
  const isValid = isValidMongoId(dealId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/amendments`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the amendments by deal Id %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the amendments by dealId' };
    }
  } else {
    console.error('Invalid deal Id %s', dealId);
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getAmendmentInProgressByDealId = async (dealId) => {
  const isValid = isValidMongoId(dealId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/amendments/in-progress`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the amendment in progress by deal Id %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the amendment in progress by dealId' };
    }
  } else {
    console.error('Invalid deal Id %s', dealId);
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getCompletedAmendmentByDealId = async (dealId) => {
  const isValid = isValidMongoId(dealId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/amendments/completed`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the completed amendment by deal Id %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the completed amendment by dealId' };
    }
  } else {
    console.error('Invalid deal Id %s', dealId);
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getLatestCompletedAmendmentByDealId = async (dealId) => {
  const isValid = isValidMongoId(dealId) && hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/amendment/completed/latest`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get the latest completed amendment by deal Id %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get the latest completed amendment by dealId' };
    }
  } else {
    console.error('Invalid deal Id %s', dealId);
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getAllAmendmentsInProgress = async () => {
  const isValid = hasValidUri(DTFS_CENTRAL_API_URL);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/amendments`,
        headers: headers.central,
      });

      return response.data;
    } catch (error) {
      console.error('Unable to get all amendments in progress %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to get all amendments in progress' };
    }
  } else {
    console.error('Invalid URL for central api');
    return { status: 400, data: 'Invalid URL for central api' };
  }
};

const updateGefFacility = async ({ facilityId, facilityUpdate, auditDetails }) => {
  try {
    const isValidFacilityId = isValidMongoId(facilityId);

    if (!isValidFacilityId) {
      console.error('updateGefFacility: Invalid facility id %s', facilityId);
      return { status: 400, data: 'Invalid facility Id provided' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/facilities/${facilityId}`,
      headers: headers.central,
      data: { facilityUpdate, auditDetails },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update facility %o', error);
    return { status: error?.code || 500, data: 'Unable to update facility' };
  }
};

const queryDeals = async ({ queryParams }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals`,
      headers: headers.central,
      params: {
        ...queryParams,
      },
    });

    return response.data;
  } catch (error) {
    console.error('queryDeals: Failed to get deals %o', error);
    return { status: error?.code || 500, data: 'Failed to get deals' };
  }
};

const getPartyDbInfo = async ({ companyRegNo }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/party-db/${encodeURIComponent(companyRegNo)}`,
      headers: headers.external,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get party DB info %o', error);
    return false;
  }
};

/**
 * Get company information from Party URN
 * @param {Integer} partyUrn Party URN
 * @returns {Promise<object>} Company information
 */
const getCompanyInfo = async (partyUrn) => {
  try {
    const isValidUrn = isValidPartyUrn(partyUrn);

    if (!isValidUrn) {
      console.error('getCompanyInfo: Invalid party Urn %s', partyUrn);
      return { status: 400, data: 'Invalid party urn provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/party-db/urn/${encodeURIComponent(partyUrn)}`,
      headers: headers.external,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get company information from PartyURN %o', error);
    return false;
  }
};

const findUser = async (username) => {
  try {
    const sanitizedUsername = sanitizeUsername(username);

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users/${sanitizedUsername}`,
      headers: headers.central,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to find user %o', error);
    return false;
  }
};

const findUserById = async (userId) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('findUserById: Invalid user id %s', userId);
      return { status: 400, data: 'Invalid user id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users/id/${userId}`,
      headers: headers.central,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to find user by id %o', error);
    return false;
  }
};

const findPortalUserById = async (userId) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('findPortalUserById: Invalid user id %s', userId);
      return { status: 400, data: 'Invalid user id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/user/${userId}`,
      headers: headers.central,
    });
    return response.data;
  } catch (error) {
    console.error('Error finding portal user %o', error);
    return false;
  }
};

const updateUserTasks = async (userId, updatedTasks) => {
  try {
    const isValidUserId = isValidMongoId(userId);

    if (!isValidUserId) {
      console.error('updateUserTasks: Invalid user id %s', userId);
      return { status: 400, data: 'Invalid user id provided' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users/${userId}/tasks`,
      headers: headers.central,
      data: {
        updatedTasks,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Unable to update user tasks %o', error);
    return false;
  }
};

const findOneTeam = async (teamId) => {
  try {
    const isValidId = isValidTeamId(teamId);

    if (!isValidId) {
      console.error('findOneTeam: Invalid team id %s', teamId);
      return { status: 400, data: 'Invalid team id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`,
      headers: headers.central,
    });

    return response.data.team;
  } catch (error) {
    console.error('findOneTeam: Failed to find team %o', error);
    return { status: error?.code || 500, data: 'Failed to find team' };
  }
};

const findTeamMembers = async (teamId) => {
  try {
    const isValidId = isValidTeamId(teamId);

    if (!isValidId) {
      console.error('findTeamMembers: Invalid team id %s', teamId);
      return { status: 400, data: 'Invalid team id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users/team/${teamId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('findTeamMembers: Failed to find team members %o', error);
    return { status: error?.code || 500, data: 'Failed to find team members' };
  }
};

const getCurrencyExchangeRate = async (source, target) => {
  try {
    const sourceIsValid = isValidCurrencyCode(source);
    const targetIsValid = isValidCurrencyCode(target);

    if (!sourceIsValid || !targetIsValid) {
      console.error('getCurrencyExchangeRate: Invalid currency provided %s, %s', source, target);
      return { status: 400, data: 'Invalid currency provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/currency-exchange-rate/${source}/${target}`,
      headers: headers.external,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get currency exchange rate %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get currency exchange rate' };
  }
};

const getFacilityExposurePeriod = async (startDate, endDate, type) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/exposure-period/${startDate}/${endDate}/${type}`,
      headers: headers.external,
    });

    return response.data;
  } catch (error) {
    console.error('TFM-API - Failed api call to getFacilityExposurePeriod %o', error);
    return { status: error?.code || 500, data: 'Failed to get facility exposure period' };
  }
};

const getPremiumSchedule = async (premiumScheduleParameters) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/premium-schedule`,
      headers: headers.external,
      data: premiumScheduleParameters,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('TFM-API error calling premium schedule %o', error);
    return null;
  }
};

const createACBS = async (deal, bank) => {
  if (!!deal && !!bank) {
    try {
      const response = await axios({
        method: 'post',
        url: `${EXTERNAL_API_URL}/acbs`,
        headers: headers.external,
        data: {
          deal,
          bank,
        },
      });
      return response.data;
    } catch (error) {
      console.error('ACBS create error\n\r %o', error);
      return false;
    }
  }
  return {};
};

const updateACBSfacility = async (facility, deal) => {
  if (!!facility && !!deal) {
    try {
      const response = await axios({
        method: 'post',
        url: `${EXTERNAL_API_URL}/acbs/facility/${facility.ukefFacilityId}/issue`,
        headers: headers.external,
        data: {
          facility,
          deal,
        },
      });
      return response.data;
    } catch (error) {
      console.error('TFM-API Facility update error %o', error);
      return { status: error?.code || 500, data: 'Failed to update ACBS facility' };
    }
  }
  return {};
};

/**
 * ACBS facility amendment
 * @param {string} ukefFacilityId UKEF Facility ID
 * @param {object} amendments Facility object comprising of amendments
 * @returns {Promise<object>} updated FMR upon success otherwise error
 */
const amendACBSfacility = async (amendments, facility, deal) => {
  if (amendments && facility.facilitySnapshot) {
    const { ukefFacilityId } = facility.facilitySnapshot;
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/acbs/facility/${ukefFacilityId}/amendments`,
      headers: headers.external,
      data: {
        amendments,
        deal,
        facility,
      },
    }).catch((error) => {
      console.error('TFM-API Facility amend error %o', error);
      return null;
    });

    if (response?.data) {
      return response.data;
    }
  }
  return null;
};

const getFunctionsAPI = async (url = '') => {
  const modifiedUrl = url ? url.replace(/http:\/\/localhost:[\d]*/, AZURE_ACBS_FUNCTION_URL) : AZURE_ACBS_FUNCTION_URL;

  try {
    const response = await axios({
      method: 'get',
      url: modifiedUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to getFunctionsAPI for %s %o', modifiedUrl, error);
    return { status: error?.code || 500, data: 'Failed to get functions API' };
  }
};

/**
 * An external API call, responsible for creating
 * eStore site, directories and documents (if applicable).
 * Upon any exception an empty object is returned.
 * @param {object} data eStore API object
 * @returns {Promise<object>} eStore API response object
 */
const createEstoreSite = async (data) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/estore`,
      headers: headers.external,
      data,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to create eStore site %o', error);
    return {};
  }
};

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/email`,
      headers: headers.external,
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Unable to send email %o', error);
    return false;
  }
};

const findOneGefDeal = async (dealId) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('findOneGefDeal: Invalid deal Id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/${dealId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('TFM API - error finding GEF deal %s', dealId);

    return false;
  }
};

const updatePortalGefDealStatus = async ({ dealId, status, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updatePortalGefDealStatus: Invalid deal Id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id provided' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/${dealId}/status`,
      headers: headers.central,
      data: {
        status,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('TFM API - error updating GEF deal status %s', dealId);

    return false;
  }
};

const updatePortalGefDeal = async ({ dealId, dealUpdate, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updatePortalGefDeal: Invalid deal Id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id provided' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/${dealId}`,
      headers: headers.central,
      data: {
        dealUpdate,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('TFM API - error updating GEF deal %s, %o', dealId, error);

    return false;
  }
};

const updateGefMINActivity = async ({ dealId, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      console.error('updateGefMINActivity: Invalid deal Id provided %s', dealId);
      return { status: 400, data: 'Invalid deal id provided' };
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/activity/${dealId}`,
      headers: headers.central,
      data: {
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('TFM API - error updating GEF deal MIN activity %s, %o', dealId, error);

    return false;
  }
};

const addUnderwriterCommentToGefDeal = async (dealId, commentType, comment, auditDetails) => {
  const isValidDealId = isValidMongoId(dealId);

  if (!isValidDealId) {
    console.error('addUnderwriterCommentToGefDeal: Invalid deal Id provided %s', dealId);
    throw new Error(`Invalid deal id: ${dealId}`);
  }

  const response = await axios({
    method: 'post',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/${dealId}/comment`,
    headers: headers.central,
    data: { dealId, commentType, comment, auditDetails },
  });

  return response.data;
};

const getAllFacilities = async ({ queryParams }) => {
  try {
    const response = await axios({
      method: 'GET',
      params: {
        ...queryParams,
      },
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities`,
      headers: headers.central,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get all facilities %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get all facilities' };
  }
};

const findBankById = async (bankId) => {
  try {
    const isValidBankId = isValidNumericId(bankId);

    if (!isValidBankId) {
      console.error('findBankById: Invalid bank Id provided %s', bankId);
      return { status: 400, data: 'Invalid bank id provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}`,
      headers: headers.central,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get bank by id:', error);
    return { status: error?.response?.status || 500, data: 'Failed to find bank by id' };
  }
};

/**
 * @typedef {object} GetBanksQuery
 * @property {boolean | undefined} includeReportingYears - Whether or not to include the bank reporting years
 */

/**
 * Get all banks
 * @param {GetBanksQuery} queryParams - The query parameters
 * @returns {Promise<import('./api-response-types').BankResponseBody[] | import('./api-response-types').BankWithReportingYearsResponseBody[]>}
 */
const getBanks = async (queryParams = {}) => {
  const url = `${DTFS_CENTRAL_API_URL}/v1/bank`;
  const response = await axios.get(url, {
    headers: headers.central,
    params: queryParams,
  });

  return response.data;
};

const getGefMandatoryCriteriaByVersion = async (version) => {
  try {
    const isValidVersion = isValidNumericId(version);

    if (!isValidVersion) {
      console.error('getGefMandatoryCriteriaByVersion: Invalid version provided %s', version);
      return { status: 400, data: 'Invalid mandatory criteria version provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/mandatory-criteria/version/${version}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get the mandatory criteria by version for GEF deals %o', error);
    return { status: error?.code || 500, data: 'Failed to get mandatory criteria by version for GEF deals' };
  }
};

/**
 * Resolves to the response of `GET /bank-holidays` from external-api.
 * @returns {Promise<import('../types/bank-holidays').BankHolidaysResponseBody>}
 */
const getBankHolidays = async () => {
  const response = await axios.get(`${EXTERNAL_API_URL}/bank-holidays`, {
    headers: headers.external,
  });

  return response.data;
};

const getUtilisationReportsReconciliationSummary = async (submissionMonth) => {
  const url = `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`;
  const response = await axios.get(url, {
    headers: headers.central,
  });

  return response.data;
};

/**
 * Get utilisation report by id
 * @param {string} id
 * @returns {Promise<import('./api-response-types').UtilisationReportResponseBody>}
 */
const getUtilisationReportById = async (id) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${id}`, {
    headers: headers.central,
  });

  return response.data;
};

/**
 * Sends a payload to DTFS central API to update
 * the status of one or more utilisation reports
 * @param {import('@ukef/dtfs2-common').ReportWithStatus[]} reportsWithStatus
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The current user stored in the session
 * @returns {Promise<{ status: number }>}
 */
const updateUtilisationReportStatus = async (reportsWithStatus, user) => {
  const response = await axios({
    method: 'put',
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/set-status`,
    headers: headers.central,
    data: {
      user,
      reportsWithStatus,
    },
  });

  return response.data;
};

/**
 * Gets the utilisation report reconciliation details by report id
 * @param {string} reportId - The report id
 * @param {import('@ukef/dtfs2-common').PremiumPaymentsFilters)} premiumPaymentsFilters - Filters to apply to the premium payments tab
 * @returns {Promise<import('./api-response-types').UtilisationReportReconciliationDetailsResponseBody>}
 */
const getUtilisationReportReconciliationDetailsById = async (reportId, premiumPaymentsFilters) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/reconciliation-details/${reportId}`, {
    headers: headers.central,
    params: {
      premiumPaymentsFilters,
    },
  });

  return response.data;
};

/**
 * Gets the utilisation report reconciliation details by report id
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The selected fee record ids
 * @param {boolean} includeAvailablePaymentGroups - Whether or not to include the available payment groups in the response
 * @returns {Promise<import('./api-response-types').SelectedFeeRecordsDetailsResponseBody>}
 */
const getSelectedFeeRecordsDetails = async (reportId, feeRecordIds, includeAvailablePaymentGroups) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/selected-fee-records-details`, {
    headers: headers.central,
    params: {
      includeAvailablePaymentGroups,
    },
    data: {
      feeRecordIds,
    },
  });

  return response.data;
};

/**
 * Gets the utilisation report summaries by bank id and year
 * @param {string} bankId - The bank id
 * @param {string} year - The year which a report period ends in
 * @returns {Promise<import('./api-response-types').UtilisationReportSummariesByBankAndYearResponseBody>}
 */
const getUtilisationReportSummariesByBankIdAndYear = async (bankId, year) => {
  const url = `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/utilisation-reports/reconciliation-summary-by-year/${year}`;
  const response = await axios.get(url, {
    headers: headers.central,
  });

  return response.data;
};

/**
 * Adds a new payment to the supplied fee records
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The list of fee record ids to add the payment to
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The user adding the payment
 * @param {import('@ukef/dtfs2-common').Currency} paymentCurrency - The payment currency
 * @param {number} paymentAmount - The payment amount
 * @param {import('@ukef/dtfs2-common').IsoDateTimeStamp} datePaymentReceived - The date the payment was received
 * @param {string | undefined} paymentReference - The payment reference
 */
const addPaymentToFeeRecords = async (reportId, feeRecordIds, user, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference) => {
  const response = await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/payment`,
    method: 'post',
    headers: headers.central,
    data: {
      feeRecordIds,
      user,
      paymentCurrency,
      paymentAmount,
      datePaymentReceived,
      paymentReference,
    },
  });
  return response.data;
};

/**
 * Generates keying data for the utilisation report
 * with the supplied id
 * @param {string} reportId - The report id
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The session user
 * @returns {Promise<void>}
 */
const generateKeyingData = async (reportId, user) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/keying-data`,
    method: 'post',
    headers: headers.central,
    data: {
      user,
    },
  });
};

/**
 * Updates keying sheet fee records with supplied ids to DONE
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the fee records to mark as DONE
 * @param {import('./types/tfm-session-user').TfmSessionUser} user - The session user
 * @returns {Promise<{}>}
 */
const markKeyingDataAsDone = async (reportId, feeRecordIds, user) => {
  await axios({
    method: 'put',
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/keying-data/mark-as-done`,
    headers: headers.central,
    data: {
      user,
      feeRecordIds,
    },
  });
};

/**
 * Updates keying sheet fee records with supplied ids to TO_DO
 * @param {string} reportId - The report id
 * @param {number[]} feeRecordIds - The ids of the fee records to mark as TO_DO
 * @param {import('./types/tfm-session-user').TfmSessionUser} user - The session user
 * @returns {Promise<{}>}
 */
const markKeyingDataAsToDo = async (reportId, feeRecordIds, user) => {
  await axios({
    method: 'put',
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/keying-data/mark-as-to-do`,
    headers: headers.central,
    data: {
      user,
      feeRecordIds,
    },
  });
};

/**
 * Gets the utilisation report with the supplied id and the
 * fee records to key
 * @param {string} reportId - The report id
 * @returns {Promise<import('./api-response-types').FeeRecordsToKeyResponseBody>} The utilisation report with fee records to key
 */
const getUtilisationReportWithFeeRecordsToKey = async (reportId) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records-to-key`, {
    headers: headers.central,
  });
  return response.data;
};

/**
 * Gets the payment details
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {boolean} includeFeeRecords - Whether or not to include the fee records in the response
 * @returns {Promise<import('./api-response-types').PaymentDetailsResponseBody>} The payment details
 */
const getPaymentDetails = async (reportId, paymentId, includeFeeRecords) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`, {
    headers: headers.central,
    params: {
      includeFeeRecords,
    },
  });
  return response.data;
};

/**
 * Deletes the payment with the specified id
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The session user
 * @returns {Promise<void>}
 */
const deletePaymentById = async (reportId, paymentId, user) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`,
    method: 'delete',
    headers: headers.central,
    data: { user },
  });
};

/**
 * Edits the payment with the supplied payment information
 * @param {string} reportId - The report id
 * @param {string} paymentId - The payment id
 * @param {number} paymentAmount - The payment amount
 * @param {import('@ukef/dtfs2-common').IsoDateTimeStamp} datePaymentReceived - The date the payment was received
 * @param {string | null} paymentReference - The payment reference
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The user
 */
const editPayment = async (reportId, paymentId, paymentAmount, datePaymentReceived, paymentReference, user) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}`,
    method: 'patch',
    headers: headers.central,
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
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The user
 */
const removeFeesFromPayment = async (reportId, paymentId, selectedFeeRecordIds, user) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/payment/${paymentId}/remove-selected-fees`,
    method: 'post',
    headers: headers.central,
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
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The user
 */
const addFeesToAnExistingPayment = async (reportId, feeRecordIds, paymentIds, user) => {
  const response = await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/add-to-an-existing-payment`,
    method: 'post',
    headers: headers.central,
    data: {
      feeRecordIds,
      paymentIds,
      user,
    },
  });
  return response.data;
};

module.exports = {
  findOneDeal,
  findOnePortalDeal,
  addPortalDealComment,
  updatePortalDeal,
  updatePortalBssDealStatus,
  updatePortalFacilityStatus,
  updatePortalFacility,
  updateDeal,
  updateDealSnapshot,
  submitDeal,
  getAllFacilities,
  findOneFacility,
  findFacilitiesByDealId,
  updateFacility,
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
  getCompletedAmendment,
  getLatestCompletedAmendmentValue,
  getLatestCompletedAmendmentDate,
  getLatestCompletedAmendmentFacilityEndDate,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAmendmentsByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
  getAllAmendmentsInProgress,
  updateGefFacility,
  queryDeals,
  getPartyDbInfo,
  getCompanyInfo,
  findUser,
  findUserById,
  updateDealCancellation,
  getDealCancellation,
  findPortalUserById,
  updateUserTasks,
  findOneTeam,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  getPremiumSchedule,
  createACBS,
  updateACBSfacility,
  amendACBSfacility,
  getFunctionsAPI,
  createEstoreSite,
  sendEmail,
  findOneGefDeal,
  updatePortalGefDealStatus,
  updatePortalGefDeal,
  addUnderwriterCommentToGefDeal,
  updateGefMINActivity,
  findBankById,
  getBanks,
  getGefMandatoryCriteriaByVersion,
  getBankHolidays,
  getUtilisationReportsReconciliationSummary,
  getUtilisationReportById,
  updateUtilisationReportStatus,
  getUtilisationReportReconciliationDetailsById,
  getSelectedFeeRecordsDetails,
  getUtilisationReportSummariesByBankIdAndYear,
  addPaymentToFeeRecords,
  generateKeyingData,
  markKeyingDataAsDone,
  markKeyingDataAsToDo,
  getUtilisationReportWithFeeRecordsToKey,
  getPaymentDetails,
  deletePaymentById,
  editPayment,
  removeFeesFromPayment,
  addFeesToAnExistingPayment,
};
