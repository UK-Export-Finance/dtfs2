const axios = require('axios');
const { HttpStatusCode } = require('axios');
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

/**
 * Finds a single portal deal by id.
 * @param {string} dealId - Portal deal id.
 * @returns {Promise<object | false | { status: number, data: string }>} Portal deal payload, false on request failure, or validation error object.
 */
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

/**
 * Updates a portal deal.
 * @param {string} dealId - Portal deal id.
 * @param {object} update - Partial deal update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Updates the status of a portal BSS deal.
 * @param {object} params - Update parameters.
 * @param {string} params.dealId - Portal deal id.
 * @param {string} params.status - New status value.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Adds a comment to a portal deal.
 * @param {string} dealId - Portal deal id.
 * @param {string} commentType - Comment category.
 * @param {string} comment - Comment text.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object>} API response payload.
 */
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

/**
 * Updates the status of a portal facility.
 * @param {string} facilityId - Portal facility id.
 * @param {string} status - New status value.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Updates a portal facility.
 * @param {string} facilityId - Portal facility id.
 * @param {object} update - Partial facility update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * @param {string} dealId
 * @returns {Promise<import('@ukef/dtfs2-common').TfmDeal}
 */
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

/**
 * Updates the snapshot object for a TFM deal.
 * @param {string} dealId - TFM deal id.
 * @param {object} snapshotUpdate - Partial snapshot update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Submits a deal to workflow processing.
 * @param {string} dealType - Deal type.
 * @param {string} dealId - Deal id.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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
 * @returns {Promise<Partial<import('@ukef/dtfs2-common').TfmDealCancellationWithStatus>>} - Deal cancellation object
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

/**
 * Deletes the deal cancellation object on a deal
 * @param {object} params
 * @param {string} params.dealId - deal cancellation to update
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - user making the request
 * @returns {Promise<void>} update result object
 */
const deleteDealCancellation = async ({ dealId, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      throw new InvalidDealIdError(dealId);
    }

    await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/cancellation`,
      headers: headers.central,
      data: {
        auditDetails,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Submits the deal cancellation
 * @param {object} params
 * @param {string} params.dealId - id of deal to cancel
 * @param {import('@ukef/dtfs2-common').TfmDealCancellation} params.cancellation - the cancellation details to submit
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - user making the request
 * @returns {Promise<import('@ukef/dtfs2-common').TfmDealCancellationResponse>} update result object
 */
const submitDealCancellation = async ({ dealId, cancellation, auditDetails }) => {
  try {
    const isValidDealId = isValidMongoId(dealId);

    if (!isValidDealId) {
      throw new InvalidDealIdError(dealId);
    }

    const response = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/cancellation/submit`,
      headers: headers.central,
      data: {
        cancellation,
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
 * Finds a single TFM facility by id.
 * @param {string} facilityId - TFM facility id.
 * @returns {Promise<object | { status: number, data: string }>} Facility payload or error object.
 */
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

/**
 * @param {string} dealId
 * @returns {Promise<import('@ukef/dtfs2-common').TfmFacility[]>}
 */
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

/**
 * Gets all amendments for all facilities in a deal
 * @param {string} dealId - The deal ID
 * @returns {Promise<{ status: number, data: import('@ukef/dtfs2-common').FacilityAllTypeAmendmentWithUkefId[] }>}
 */
const getApprovedAmendments = async (dealId) => {
  const isValid = isValidMongoId(dealId) && hasValidUri(DTFS_CENTRAL_API_URL);

  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}/amendments/approved`,
        headers: headers.central,
      });

      if (!response?.data) {
        throw new Error('Invalid response received');
      }

      return { status: HttpStatusCode.Ok, data: response.data };
    } catch (error) {
      console.error('Unable to get the approved amendments %o', error);
      return { status: error?.response?.status || HttpStatusCode.InternalServerError, data: 'Failed to get the approved amendments' };
    }
  } else {
    console.error('Invalid deal Id %s', dealId);
    return { status: HttpStatusCode.BadRequest, data: 'Invalid deal Id provided' };
  }
};

/**
 * Updates a TFM facility.
 * @param {object} params - Update parameters.
 * @param {string} params.facilityId - Facility id.
 * @param {object} params.tfmUpdate - Partial TFM update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Creates a facility amendment.
 * @param {string} facilityId - Facility id.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Updates a facility amendment.
 * @param {string} facilityId - Facility id.
 * @param {string} amendmentId - Amendment id.
 * @param {object} payload - Amendment update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Gets the in-progress amendment for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<{ status: number, data: object }>} Response wrapper containing amendment data or error details.
 */
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

/**
 * Gets completed amendments for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<object | { status: number, data: string }>} Completed amendment payload or error object.
 */
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

/**
 * Gets the latest completed amendment value for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment value payload or error object.
 */
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

/**
 * Gets the latest completed amendment cover end date for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment date payload or error object.
 */
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

/**
 * Gets the latest completed facility end date amendment for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets a specific amendment by facility id and amendment id.
 * @param {string} facilityId - Facility id.
 * @param {string} amendmentId - Amendment id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets amendments for a facility.
 * @param {string} facilityId - Facility id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets amendments for a deal.
 * @param {string} dealId - Deal id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets in-progress amendments for a deal.
 * @param {string} dealId - Deal id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets completed amendments for a deal.
 * @param {string} dealId - Deal id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets the latest completed amendment for a deal.
 * @param {string} dealId - Deal id.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Gets all in-progress amendments.
 * @returns {Promise<object | { status: number, data: string }>} Amendment payload or error object.
 */
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

/**
 * Updates a GEF portal facility.
 * @param {object} params - Update parameters.
 * @param {string} params.facilityId - Facility id.
 * @param {object} params.facilityUpdate - Partial facility update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Queries TFM deals using query parameters.
 * @param {object} params - Query parameters wrapper.
 * @param {object} params.queryParams - Query string parameters.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Gets party information from external-api by company registration number.
 * @param {object} params - Query parameters wrapper.
 * @param {string} params.companyRegNo - Company registration number.
 * @returns {Promise<object | false>} Company payload or false when the request fails.
 */
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
 * Calls getOrCreatePartyDbInfo in external-api to get a customer in Salesforce, and create it if it doesn't exist
 * @param {string} companyRegNo Party URN
 * @param {string} companyName Company name
 * @param {string} probabilityOfDefault Probability of default
 * @param {boolean} isUkEntity Whether the party source country is UK or not
 * @param {number} code SIC industry sector code
 * @returns {Promise<object>} Company information
 */
const getOrCreatePartyDbInfo = async ({ companyRegNo, companyName, probabilityOfDefault, isUkEntity, code }) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/party-db`,
      headers: headers.external,
      data: {
        companyRegNo,
        companyName,
        probabilityOfDefault,
        isUkEntity,
        code,
      },
    });

    return response?.data;
  } catch (error) {
    console.error('Unable to get or create party %o', error);
    return false;
  }
};

/**
 * Get company information from Party URN
 * @param {number} partyUrn Party URN
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

    return response?.data;
  } catch (error) {
    console.error('Unable to get company information from PartyURN %o', error);
    return false;
  }
};

/**
 * Get credit risk ratings
 * @returns {Promise<import('./api-response-types').CreditRiskRating[] | false>}
 */
const getCreditRiskRatings = async () => {
  try {
    console.info('Calling external API "Get credit risk ratings" endpoint');

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/credit-risk-ratings`,
      headers: headers.external,
    });

    return response?.data;
  } catch (error) {
    console.error('Unable to get credit risk ratings %o', error);
    return false;
  }
};

/**
 * Get facility categories
 * @returns {Promise<import('./api-response-types').FacilityCategory[] | false>}
 */
const getFacilityCategories = async () => {
  try {
    console.info('Calling external API "Get facility categories" endpoint');

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/facility-categories`,
      headers: headers.external,
    });

    return response?.data;
  } catch (error) {
    console.error('Unable to get facility categories %o', error);
    return false;
  }
};

/**
 * Get obligation subtypes
 * @returns {Promise<import('./api-response-types').ObligationSubtype[] | false>}
 */
const getObligationSubtypes = async () => {
  try {
    console.info('Calling external API "Get obligation subtypes" endpoint');

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/obligation-subtypes`,
      headers: headers.external,
    });

    return response?.data;
  } catch (error) {
    console.error('Unable to get obligation subtypes %o', error);
    return false;
  }
};

/**
 * Get a UKEF industry code by Companies House industry code
 * @param {string} industryCode Companies House industry code
 * @returns {Promise<import('./api-response-types').UkefIndustryCode | false>}
 */
const getUkefIndustryCodeByCompaniesHouseIndustryCode = async (industryCode) => {
  try {
    console.info('Calling external API "Get UKEF industry code by companies house industry code" endpoint - industryCode %s', industryCode);

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/ukef-industry-code/by-companies-house-industry-code/${encodeURIComponent(industryCode)}`,
      headers: headers.external,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get UKEF industry code by Companies House industry code %s %o', industryCode, error);
    return false;
  }
};

/**
 * Find a TFM user by username
 * @param {string} username TFM username
 * @returns {Promise<object>} User information
 * @throws {Error} If an unexpected error occurs during the request.
 */
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
    console.error('Unable to find TFM user %s %o', username, error);
    return false;
  }
};

/**
 * Find a TFM user by ID
 * @param {string} userId TFM user ID
 * @returns {Promise<object>} User information
 * @throws {Error} If an unexpected error occurs during the request.
 */
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

/**
 * Find a Portal user by ID
 * @param {string} userId Portal user ID
 * @returns {Promise<object>} User information
 * @throws {Error} If an unexpected error occurs during the request.
 */
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

/**
 * Updates task assignments for a TFM user.
 * @param {string} userId - TFM user id.
 * @param {object[]} updatedTasks - Updated task list.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Retrieves a TFM team by its ID.
 *
 * @param {string} teamId - The ID of the TFM team to retrieve.
 * @returns {Promise<import('@ukef/dtfs2-common').Team>} A promise that resolves to the TFM team data if successful,
 * or an object containing an error status and message if the operation fails.
 *
 * @throws {Error} If an unexpected error occurs during the request.
 */
const findOneTeam = async (teamId) => {
  try {
    const isValidId = isValidTeamId(teamId);

    if (!isValidId) {
      console.error('Invalid TFM team ID %s provided', teamId);
      return { status: axios.HttpStatusCode.BadRequest, data: 'Invalid TFM team ID provided' };
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`,
      headers: headers.central,
    });

    return response.data?.team;
  } catch (error) {
    console.error('Unable to get the TFM team with ID %s %o', teamId, error);
    return { status: error?.code || axios.HttpStatusCode.InternalServerError, data: 'Failed to find team' };
  }
};

/**
 * Retrieves members of a TFM team.
 * @param {string} teamId - Team id.
 * @returns {Promise<object | { status: number, data: string }>} Team members payload or error object.
 */
const findTeamMembers = async (teamId) => {
  try {
    const isValidId = isValidTeamId(teamId);

    if (!isValidId) {
      console.error('findTeamMembers: Invalid team id %s', teamId);
      return { status: axios.HttpStatusCode.BadRequest, data: 'Invalid TFM team ID provided' };
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

/**
 * Gets a currency exchange rate.
 * @param {string} source - Source currency code.
 * @param {string} target - Target currency code.
 * @returns {Promise<object | { status: number, data: string }>} Exchange rate payload or error object.
 */
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

/**
 * Gets exposure period details for a facility date range.
 * @param {string} startDate - Start date.
 * @param {string} endDate - End date.
 * @param {string} type - Facility type.
 * @returns {Promise<object | { status: number, data: string }>} Exposure period payload or error object.
 */
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

/**
 * Gets a premium schedule from external-api.
 * @param {object} premiumScheduleParameters - Premium schedule query payload.
 * @returns {Promise<object | null>} Premium schedule payload or null when unavailable.
 */
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

/**
 * Creates ACBS records for a deal and bank.
 * @param {object} deal - Deal payload.
 * @param {object} bank - Bank payload.
 * @returns {Promise<object | false | {}>} API response payload, false on request failure, or empty object when inputs are missing.
 */
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

/**
 * Issues an ACBS facility.
 * @param {object} facility - Facility payload including UKEF facility id.
 * @param {object} deal - Deal payload.
 * @returns {Promise<object | { status: number, data: string } | {}>} API response payload, error object on failure, or empty object when inputs are missing.
 */
const issueACBSfacility = async (facility, deal) => {
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

/**
 * Calls the Azure functions API endpoint used by ACBS integrations.
 * @param {string} [url] - Optional URL to rewrite to configured Azure function host.
 * @returns {Promise<object | { status: number, data: string }>} API response payload or error object.
 */
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

/**
 * Sends an email via external-api.
 * @param {string} templateId - GOV.UK Notify template id.
 * @param {string} sendToEmailAddress - Recipient email address.
 * @param {object} emailVariables - Template variables.
 * @returns {Promise<object | false>} API response payload or false when the request fails.
 */
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

/**
 * Finds a single GEF portal deal by id.
 * @param {string} dealId - GEF portal deal id.
 * @returns {Promise<object | false | { status: number, data: string }>} Deal payload, false on request failure, or validation error object.
 */
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

/**
 * Updates status for a GEF portal deal.
 * @param {object} params - Update parameters.
 * @param {string} params.dealId - GEF portal deal id.
 * @param {string} params.status - New status value.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Updates a GEF portal deal.
 * @param {object} params - Update parameters.
 * @param {string} params.dealId - GEF portal deal id.
 * @param {object} params.dealUpdate - Partial deal update payload.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Updates MIN activity for a GEF portal deal.
 * @param {object} params - Update parameters.
 * @param {string} params.dealId - GEF portal deal id.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - User audit details.
 * @returns {Promise<object | false | { status: number, data: string }>} API response payload, false on request failure, or validation error object.
 */
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

/**
 * Adds an underwriter comment to a GEF portal deal.
 * @param {string} dealId - GEF portal deal id.
 * @param {string} commentType - Comment category.
 * @param {string} comment - Comment text.
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - User audit details.
 * @returns {Promise<object>} API response payload.
 */
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

/**
 * Gets all facilities with optional filters.
 * @param {object} params - Query parameters wrapper.
 * @param {object} params.queryParams - Query string parameters.
 * @returns {Promise<object | { status: number, data: string }>} Facilities payload or error object.
 */
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

/**
 * Finds a bank by numeric id.
 * @param {string | number} bankId - Bank id.
 * @returns {Promise<object | { status: number, data: string }>} Bank payload or error object.
 */
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

/**
 * Gets GEF mandatory criteria by version number.
 * @param {string | number} version - Mandatory criteria version.
 * @returns {Promise<object | { status: number, data: string }>} Mandatory criteria payload or error object.
 */
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

/**
 * Gets utilisation reconciliation summary for a submission month.
 * @param {string} submissionMonth - Submission month in expected API format.
 * @returns {Promise<import('./api-response-types').UtilisationReportsReconciliationSummaryResponseBody>}
 */
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
 * Gets the utilisation report reconciliation details by report id
 * @param {string} reportId - The report id
 * @param {import('@ukef/dtfs2-common').PremiumPaymentsFilters)} premiumPaymentsFilters - Filters to apply to the premium payments tab
 * @param {import('@ukef/dtfs2-common').PaymentDetailsFilters)} paymentDetailsFilters - Filters to apply to the payment details tab
 * @returns {Promise<import('./api-response-types').UtilisationReportReconciliationDetailsResponseBody>}
 */
const getUtilisationReportReconciliationDetailsById = async (reportId, premiumPaymentsFilters, paymentDetailsFilters) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/reconciliation-details/${reportId}`, {
    headers: headers.central,
    params: {
      premiumPaymentsFilters,
      paymentDetailsFilters,
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user adding the payment
 * @param {import('@ukef/dtfs2-common').Currency} paymentCurrency - The payment currency
 * @param {number} paymentAmount - The payment amount
 * @param {import('@ukef/dtfs2-common').IsoDateTimeStamp} datePaymentReceived - The date the payment was received
 * @param {string | undefined} paymentReference - The payment reference
 * @returns {Promise<import('./api-response-types').AddPaymentResponseBody>}
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The session user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
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
 * @param {import('@ukef/dtfs2-common').TfmSessionUser} user - The user
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

/**
 * Gets the fee record by report id and fee record id
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @returns {Promise<import('./api-response-types').FeeRecordResponseBody>}
 */
const getFeeRecord = async (reportId, feeRecordId) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}`, {
    headers: headers.central,
  });

  return response.data;
};

/**
 * Gets the fee record correction request review details
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {string} userId - The id of the user making the correction request
 * @returns {Promise<import('./api-response-types').FeeRecordCorrectionRequestReviewResponseBody>}
 */
const getFeeRecordCorrectionRequestReview = async (reportId, feeRecordId, userId) => {
  const response = await axios.get(
    `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-request-review/${userId}`,
    {
      headers: headers.central,
    },
  );

  return response.data;
};

/**
 * Updates the fee record correction transient form data associated with the given fee record id and user
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('@ukef/dtfs2-common').RecordCorrectionRequestTransientFormData} formData
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The current user stored in the session
 */
const updateFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, formData, user) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-request-transient-form-data`,
    method: 'put',
    headers: headers.central,
    data: {
      formData,
      user,
    },
  });
};

/**
 * Gets the fee record correction transient form data by report id, fee record id, and user id
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {string} userId - The user id
 * @returns {Promise<import('@ukef/dtfs2-common').RecordCorrectionRequestTransientFormData | {}>}
 */
const getFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, userId) => {
  const response = await axios.get(
    `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-request-transient-form-data/${userId}`,
    {
      headers: headers.central,
    },
  );

  return response.data;
};

/**
 * Deletes fee record correction transient form data by report id, fee record id, and user id
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {string} userId - The user id
 * @returns {Promise<void>}
 */
const deleteFeeRecordCorrectionTransientFormData = async (reportId, feeRecordId, userId) => {
  await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/correction-request-transient-form-data/${userId}`,
    method: 'delete',
    headers: headers.central,
  });
};

/**
 * Creates a fee record correction
 * @param {string} reportId - The report id
 * @param {string} feeRecordId - The fee record id
 * @param {import('../types/tfm-session-user').TfmSessionUser} user - The requesting user
 * @returns {Promise<import('./api-response-types').FeeRecordCorrectionResponseBody>}
 */
const createFeeRecordCorrection = async (reportId, feeRecordId, user) => {
  const response = await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${reportId}/fee-records/${feeRecordId}/corrections`,
    method: 'post',
    headers: headers.central,
    data: {
      user,
    },
  });

  return response.data;
};

/**
 * Gets the record correction log details by report id
 * @param {string} correctionId - The correction id
 * @returns {Promise<import('@ukef/dtfs2-common').GetRecordCorrectionLogDetailsResponseBody>}
 */
const getRecordCorrectionLogDetailsById = async (correctionId) => {
  const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/record-correction-log-details/${correctionId}`, {
    headers: headers.central,
  });

  return response.data;
};

/**
 * Create a GIFT facility.
 * @param {import('./mappings/apim-gift-payloads/types').ApimGiftFacilityCreationPayload} facilityData - The data for the facility to be created
 * @returns {Promise<object|boolean>} The created facility data if successful, otherwise false
 */
const createGiftFacility = async (facilityData) => {
  let facilityId;
  let dealId;

  try {
    facilityId = facilityData?.overview?.facilityId;
    dealId = facilityData?.riskDetails?.dealId;

    console.info('Calling external API "Create GIFT facility" endpoint - facilityId %s dealId %s', facilityId, dealId);

    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/gift/facility`,
      headers: headers.external,
      data: facilityData,
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
    const responseBody = error?.response?.data ?? { message: 'No response received from external API GIFT facility creation endpoint' };

    console.error(
      'Unable to send GIFT facility to external API - facilityId %s dealId %s status %s responseBody %o error %o',
      facilityId,
      dealId,
      status,
      responseBody,
      error,
    );

    return false;
  }
};

/**
 * Find GIFT facilities by their IDs.
 * @param {string} facilityIdsQueryString - Comma-separated facility IDs to find.
 * @returns {Promise<{ facilities: object[] }|false>} The API response payload if successful, otherwise false.
 */
const findGiftFacilitiesByIds = async (facilityIdsQueryString) => {
  try {
    console.info('Calling external API "Get GIFT facilities by ID" endpoint - facilityIds %o', facilityIdsQueryString);

    const queryString = new URLSearchParams({ ids: facilityIdsQueryString }).toString();

    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/gift/facilities?${queryString}`,
      headers: headers.external,
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
    const responseBody = error?.response?.data ?? { message: 'No response received from external API GIFT facilities endpoint' };

    console.error(
      'Unable to get GIFT facilities from external API - facilityIds %o status %s responseBody %o error %o',
      facilityIdsQueryString,
      status,
      responseBody,
      error,
    );

    return false;
  }
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
  getOrCreatePartyDbInfo,
  getCompanyInfo,
  getCreditRiskRatings,
  getFacilityCategories,
  getObligationSubtypes,
  getUkefIndustryCodeByCompaniesHouseIndustryCode,
  findUser,
  findUserById,
  updateDealCancellation,
  getDealCancellation,
  deleteDealCancellation,
  submitDealCancellation,
  findPortalUserById,
  updateUserTasks,
  findOneTeam,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  getPremiumSchedule,
  createACBS,
  issueACBSfacility,
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
  getFeeRecord,
  getFeeRecordCorrectionRequestReview,
  updateFeeRecordCorrectionTransientFormData,
  getFeeRecordCorrectionTransientFormData,
  deleteFeeRecordCorrectionTransientFormData,
  createFeeRecordCorrection,
  getRecordCorrectionLogDetailsById,
  getApprovedAmendments,
  createGiftFacility,
  findGiftFacilitiesByIds,
};
