const FormData = require('form-data');
const { isValidCompanyRegistrationNumber, InvalidFacilityIdError, InvalidDealIdError, TIMEOUT } = require('@ukef/dtfs2-common');
const { PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID } = require('@ukef/dtfs2-common/schemas');
const { HttpStatusCode } = require('axios');
const { portalApi, externalApi } = require('./axios');
const { apiErrorHandler } = require('../utils/helpers');
const { isValidMongoId, isValidUkPostcode } = require('../utils/validateIds');

const config = (userToken) => ({ headers: { Authorization: userToken } });

const validateToken = async (userToken) => {
  try {
    const { status } = await portalApi.get('/validate', config(userToken));
    return status === HttpStatusCode.Ok;
  } catch (error) {
    return false;
  }
};

const validateBank = async ({ dealId, bankId, userToken }) => {
  try {
    const { data } = await portalApi.get('/validate/bank', { ...config(userToken), data: { dealId, bankId } });
    return data;
  } catch (error) {
    console.error('Unable to validate the bank %o', error);
    return { status: error?.response?.status || HttpStatusCode.InternalServerError, data: 'Failed to validate bank' };
  }
};

const getMandatoryCriteria = async ({ userToken }) => {
  try {
    const { data } = await portalApi.get('/gef/mandatory-criteria-versioned/latest', config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

/**
 * Fetches the details of a TFM team by its ID.
 *
 * @param {Object} params - The parameters for the request.
 * @param {string} params.teamId - The ID of the team to fetch.
 * @param {string} params.userToken - The user authentication token.
 * @returns {Promise<import('@ukef/dtfs2-common'.Team)>} A promise that resolves to the team data.
 * @throws {Error} Throws an error if the request fails.
 */
const getTfmTeam = async ({ teamId, userToken }) => {
  try {
    const { data } = await portalApi.get(`/tfm/team/${teamId}`, config(userToken));
    return data;
  } catch (error) {
    console.error('Unable to get TFM team %s %o', teamId, error);
    throw error;
  }
};

const createApplication = async ({ payload, userToken }) => {
  try {
    const { data } = await portalApi.post('/gef/application', payload, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const cloneApplication = async ({ payload, userToken }) => {
  try {
    const { data } = await portalApi.post('/gef/application/clone', payload, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

/**
 * @param {Object} param
 * @param {string} param.dealId
 * @param {string} param.userToken
 * @returns {Promise<import('../types/deal').Deal}>}
 */
const getApplication = async ({ dealId, userToken }) => {
  if (!isValidMongoId(dealId)) {
    console.error('getApplication: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await portalApi.get(`/gef/application/${dealId}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateApplication = async ({ dealId, application, userToken }) => {
  if (!isValidMongoId(dealId)) {
    console.error('updateApplication: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await portalApi.put(`/gef/application/${dealId}`, application, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateSupportingInformation = async ({ dealId, application, field, user, userToken }) => {
  if (!isValidMongoId(dealId)) {
    console.error('updateSupportingInformation: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await portalApi.put(`/gef/application/supporting-information/${dealId}`, { application, field, user }, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

/**
 * Updates the application status for a specific deal.
 *
 * Notably, the timeout is so long because in the event that the deal status is being updated to 'Submitted',
 * multiple API calls are triggered, and the user has to wait for the completion of these in the UI in the
 * current implementation.
 *
 * In the future, these operations should instead be run as part of a fail-safe background process, as discussed
 * in the root README. At that point, the timeout can be reduced.
 */
const setApplicationStatus = async ({ dealId, status, userToken }) => {
  if (!isValidMongoId(dealId)) {
    console.error('setApplicationStatus: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await portalApi.put(
      `/gef/application/status/${dealId}`,
      {
        status,
      },
      {
        ...config(userToken),
        timeout: TIMEOUT.MEDIUM,
      },
    );
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getFacilities = async ({ dealId, userToken }) => {
  if (!dealId) {
    return [];
  }

  try {
    const { data } = await portalApi.get('/gef/facilities', { ...config(userToken), params: { dealId } });
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const createFacility = async ({ payload, userToken }) => {
  try {
    const { data } = await portalApi.post('/gef/facilities', payload, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.userToken
 * @returns {Promise<{ details: import('../types/facility').Facility }>}
 */
const getFacility = async ({ facilityId, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('getFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await portalApi.get(`/gef/facilities/${facilityId}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateFacility = async ({ facilityId, payload, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('updateFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await portalApi.put(`/gef/facilities/${facilityId}`, payload, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const deleteFacility = async ({ facilityId, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('deleteFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await portalApi.delete(`/gef/facilities/${facilityId}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getCompanyByRegistrationNumber = async ({ registrationNumber, userToken }) => {
  try {
    if (!registrationNumber) {
      return {
        errRef: 'regNumber',
        errMsg: 'Enter a Companies House registration number',
      };
    }

    if (!isValidCompanyRegistrationNumber(registrationNumber)) {
      return {
        errRef: 'regNumber',
        errMsg: 'Enter a valid Companies House registration number',
      };
    }

    const { data } = await portalApi.get(`/gef/companies/${registrationNumber}`, config(userToken));

    return { company: data };
  } catch (error) {
    console.error(`Error calling Portal API 'GET /gef/companies/:registrationNumber': %o`, error);
    switch (error?.response?.status) {
      case HttpStatusCode.BadRequest:
        return {
          errRef: 'regNumber',
          errMsg: 'Enter a valid Companies House registration number',
        };
      case HttpStatusCode.NotFound:
        return {
          errRef: 'regNumber',
          errMsg: 'No company matching the Companies House registration number entered was found',
        };
      case HttpStatusCode.UnprocessableEntity:
        return {
          errRef: 'regNumber',
          errMsg: 'UKEF can only process applications from companies based in the UK',
        };
      default:
        throw error;
    }
  }
};

const getAddressesByPostcode = async ({ postcode, userToken }) => {
  if (!isValidUkPostcode(postcode)) {
    console.error('getAddressesByPostcode: API call failed for postcode %s, validation failed before call', postcode);
    throw new Error('Invalid postcode');
  }

  try {
    const { data } = await portalApi.get(`/gef/address/${postcode}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

/**
 * @param {Object} param
 * @param {string} param.userId
 * @param {string} param.userToken
 * @returns {Promise<import('@ukef/dtfs2-common').PortalSessionUser>}
 */
const getUserDetails = async ({ userId, userToken }) => {
  if (!userToken || !userId) {
    return false;
  }

  if (!isValidMongoId(userId)) {
    console.error('getUserDetails API call failed for id %s', userId);
    return false;
  }

  try {
    const { data } = await portalApi.get(`/users/${userId}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const uploadFile = async ({ files, id, userToken, maxSize: maxFileSize, documentPath }) => {
  if (!files?.length || !id || !userToken) {
    console.error('uploadFile: API call failed for id %s, number of files %s, user token %s', id, files?.length, userToken);
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('uploadFile API call failed for id %s', id);
    return false;
  }

  const formData = new FormData();

  formData.append('parentId', id);
  if (maxFileSize) formData.append('maxSize', maxFileSize);

  formData.append('documentPath', documentPath);
  files.forEach((file) => {
    formData.append(file.fieldname, file.buffer, file.originalname);
  });

  const formHeaders = formData.getHeaders();

  try {
    const baseConfig = config(userToken);
    const { data } = await portalApi.post('/gef/files/', formData, {
      ...baseConfig,
      headers: {
        ...baseConfig.headers,
        ...formHeaders,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return data;
  } catch (error) {
    console.error('GEF-UI - Error uploading file %o', error);
    return apiErrorHandler(error);
  }
};

const deleteFile = async ({ fileId, userToken, documentPath }) => {
  try {
    const { data } = await portalApi.delete(`/gef/files/${fileId}`, {
      ...config(userToken),
      data: { documentPath },
    });
    return data;
  } catch (error) {
    console.error('Unable to delete the file %o', error);
    return apiErrorHandler(error);
  }
};

const downloadFile = async ({ fileId, userToken }) => {
  if (!isValidMongoId(fileId)) {
    console.error('downloadFile: API call failed for fileId %s', fileId);
    return false;
  }

  try {
    const { data } = await portalApi({
      ...config(userToken),
      method: 'get',
      responseType: 'stream',
      url: `/gef/files/${fileId}/download`,
    });
    return data;
  } catch (error) {
    console.error('Unable to download the file %o', error);
    return apiErrorHandler(error);
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.amendmentId
 * @param {string} param.userToken
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>}
 */
const getAmendment = async ({ facilityId, amendmentId, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    throw new Error('Invalid facility ID');
  }

  if (!isValidMongoId(amendmentId)) {
    throw new Error('Invalid amendment ID');
  }

  try {
    const response = await portalApi.get(`/gef/facilities/${facilityId}/amendments/${amendmentId}`, config(userToken));
    const { success, error, data } = PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID.safeParse(response.data);

    if (success) {
      return data;
    }

    throw new Error(`Failed to parse response body from portal-api. ${error}`);
  } catch (error) {
    console.error('Failed to get the amendment with facility id %s and amendment id %s: %o', facilityId, amendmentId, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.dealId
 * @param {string} param.userToken
 * @param {(import('@ukef/dtfs2-common').PortalAmendmentStatus | import('@ukef/dtfs2-common').TfmAmendmentStatus)[] | undefined} param.statuses
 * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAllTypeAmendmentWithUkefId[])>}>}
 */
const getAmendmentsOnDeal = async ({ dealId, userToken, statuses }) => {
  if (!isValidMongoId(dealId)) {
    console.error('Invalid deal ID %s', dealId);
    throw new InvalidDealIdError(dealId);
  }

  try {
    const response = await portalApi.get(`/gef/deals/${dealId}/all-types-amendments`, { ...config(userToken), params: { statuses } });

    return response.data;
  } catch (error) {
    console.error('Failed to get amendments for facilities on deal with id %s: %o', dealId, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.dealId
 * @param {string} param.userToken
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus[] | undefined} param.statuses
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId[])>}>}
 */
const getPortalAmendmentsOnDeal = async ({ dealId, userToken, statuses }) => {
  if (!isValidMongoId(dealId)) {
    console.error('Invalid deal ID %s', dealId);
    throw new InvalidDealIdError(dealId);
  }

  try {
    const response = await portalApi.get(`/gef/deals/${dealId}/amendments`, { ...config(userToken), params: { statuses } });

    return response.data;
  } catch (error) {
    console.error('Failed to get portal amendments for facilities on deal with id %s: %o', dealId, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.dealId
 * @param {import('@ukef/dtfs2-common').PortalFacilityAmendmentUserValues} param.amendment
 * @param {string} param.userToken
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>}
 */
const upsertAmendment = async ({ facilityId, dealId, amendment, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('Invalid facility ID %s', facilityId);
    throw new InvalidFacilityIdError(facilityId);
  }

  if (!isValidMongoId(dealId)) {
    console.error('Invalid deal ID %s', dealId);
    throw new InvalidDealIdError(dealId);
  }

  const payload = {
    amendment,
    dealId,
  };

  try {
    const { data } = await portalApi.put(`/gef/facilities/${facilityId}/amendments`, payload, { ...config(userToken) });

    return data;
  } catch (error) {
    console.error('Failed to upsert the amendment to facility with id: %s and amendment details: %o: %o', facilityId, payload, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.amendmentId
 * @param {import('@ukef/dtfs2-common').PortalFacilityAmendmentUserValues} param.update
 * @param {string} param.userToken
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>}
 */
const updateAmendment = async ({ facilityId, amendmentId, update, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('Invalid facility ID %s', facilityId);
    throw new InvalidFacilityIdError(facilityId);
  }

  if (!isValidMongoId(amendmentId)) {
    console.error('Invalid amendment ID %s', amendmentId);
    throw new Error('Invalid amendment ID');
  }

  const payload = {
    update,
  };

  try {
    const { data } = await portalApi.patch(`/gef/facilities/${facilityId}/amendments/${amendmentId}`, payload, { ...config(userToken) });
    return data;
  } catch (error) {
    console.error('Failed to update the amendment with id %s on facility with id %s with update: %o %o', amendmentId, facilityId, payload, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.amendmentId
 * @param {string} param.referenceNumber
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus} param.status
 * @param {string} param.userToken
 * @param {string} param.makersEmail - The maker's email address to send the notification to
 * @param {string} param.checkersEmail - The checker's email address to send the notification to
 * @param {string} param.pimEmail - The pim's email address to send the notification to
 * @param {import('@ukef/dtfs2-common').PortalAmendmentSubmittedToUkefEmailVariables} param.emailVariables
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>}
 */
const updateSubmitAmendment = async ({ facilityId, amendmentId, referenceNumber, status, userToken, makersEmail, checkersEmail, pimEmail, emailVariables }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('Invalid facility ID %s', facilityId);
    throw new InvalidFacilityIdError(facilityId);
  }

  if (!isValidMongoId(amendmentId)) {
    console.error('Invalid amendment ID %s', amendmentId);
    throw new Error('Invalid amendment ID');
  }

  const payload = {
    referenceNumber,
    newStatus: status,
    makersEmail,
    checkersEmail,
    pimEmail,
    emailVariables,
  };

  try {
    const { data } = await portalApi.patch(`/gef/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment`, payload, { ...config(userToken) });
    return data;
  } catch (error) {
    console.error('Failed to update the amendment with id %s on facility id %s with update %o %o', amendmentId, facilityId, payload, error);
    throw error;
  }
};

/**
 * variables for email variables set to empty strings
 * if emailVariables is not provided, then this is the default object
 */
const emptyEmailVariables = {
  exporterName: '',
  bankInternalRefName: '',
  ukefDealId: '',
  ukefFacilityId: '',
  makersName: '',
  checkersName: '',
  dateSubmittedByMaker: '',
  dateEffectiveFrom: '',
  newCoverEndDate: '',
  newFacilityEndDate: '',
  newFacilityValue: '',
  portalUrl: '',
  makersEmail: '',
};

/**
 * @param {import('@ukef/dtfs2-common').AmendmentUpdateStatus} param
 * @param {string} param.facilityId
 * @param {string} param.amendmentId
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus} param.newStatus
 * @param {string} param.userToken
 * @param {string} param.makersEmail
 * @param {string} param.checkersEmail
 * @param {import('@ukef/dtfs2-common').PortalAmendmentSubmittedToCheckerEmailVariables | import('@ukef/dtfs2-common').PortalAmendmentReturnToMakerEmailVariables } param.emailVariables
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>}
 */
const updateAmendmentStatus = async ({
  facilityId,
  amendmentId,
  newStatus,
  userToken,
  makersEmail = '',
  checkersEmail = '',
  emailVariables = emptyEmailVariables,
}) => {
  if (!isValidMongoId(facilityId)) {
    console.error('Invalid facility ID %s', facilityId);
    throw new InvalidFacilityIdError(facilityId);
  }

  if (!isValidMongoId(amendmentId)) {
    console.error('Invalid amendment ID %s', amendmentId);
    throw new Error('Invalid amendment ID');
  }

  const payload = {
    newStatus,
    makersEmail,
    checkersEmail,
    emailVariables,
  };

  try {
    const { data } = await portalApi.patch(`/gef/facilities/${facilityId}/amendments/${amendmentId}/status`, payload, { ...config(userToken) });
    return data;
  } catch (error) {
    console.error('Failed to update the status of amendment with id %s on facility with id %s to status: %s %o', amendmentId, facilityId, newStatus, error);
    throw error;
  }
};

/**
 * @param {Object} param
 * @param {string} param.facilityId
 * @param {string} param.amendmentId
 * @param {string} param.userToken
 * @returns {Promise<void>}
 */
const deleteAmendment = async ({ facilityId, amendmentId, userToken }) => {
  if (!isValidMongoId(facilityId)) {
    console.error('Invalid facility ID %s', facilityId);
    throw new InvalidFacilityIdError(facilityId);
  }

  if (!isValidMongoId(amendmentId)) {
    console.error('Invalid amendment ID %s', amendmentId);
    throw new Error('Invalid amendment ID');
  }

  try {
    return portalApi.delete(`/gef/facilities/${facilityId}/amendments/${amendmentId}`, { ...config(userToken) });
  } catch (error) {
    console.error('Failed to delete the amendment with id %s on facility with id %s %o', amendmentId, facilityId, error);
    throw error;
  }
};

/**
 * Retrieves a TFM deal by its ID from `tfm-deal` collection.
 *
 * @async
 * @function getTfmDeal
 * @param {Object} params - The parameters for retrieving the deal.
 * @param {string} params.dealId - The MongoDB ID of the deal to retrieve.
 * @param {string} params.userToken - The user authentication token.
 * @returns {Promise<Object>} The portalApi response containing the TFM deal data.
 * @throws {Error} If the deal ID is invalid or the request fails.
 */
const getTfmDeal = async ({ dealId, userToken }) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Invalid deal ID %s', dealId);
      throw new Error('Invalid deal ID');
    }

    const response = await portalApi.get(`/tfm/deal/${dealId}`, {
      ...config(userToken),
    });

    if (!response?.data) {
      throw new Error('Invalid TFM deal response received');
    }

    return response.data;
  } catch (error) {
    console.error('Unable to get TFM deal %s %o', dealId, error);
    return false;
  }
};

/**
 * Retrieves a TFM deal by its ID from `tfm-deal` collection.
 *
 * @async
 * @function getTfmDeal
 * @param {Object} params - The parameters for retrieving the deal.
 * @param {string} params.facilityId - The MongoDB ID of the deal to retrieve.
 * @param {string} params.userToken - The user authentication token.
 * @returns {Promise<(import('@ukef/dtfs2-common').TfmFacility)>} The portalApi response containing the TFM deal data.
 * @throws {Error} If the deal ID is invalid or the request fails.
 */
const getTfmFacility = async ({ facilityId, userToken }) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Invalid facility ID %s', facilityId);
      throw new Error('Invalid facility ID');
    }

    const response = await portalApi.get(`/tfm/facility/${facilityId}`, {
      ...config(userToken),
    });

    if (!response?.data) {
      throw new Error('Invalid TFM facility response received');
    }

    return response.data;
  } catch (error) {
    console.error('Unable to get TFM facility %s %o', facilityId, error);
    return false;
  }
};

/**
 * @param {string | undefined} startDate
 * @param {string | undefined} endDate
 * @param {string | undefined} type
 * @returns {Promise<(import('@ukef/dtfs2-common'.FacilityExposurePeriod))>} The portalApi response containing the facility exposure period data.
 */
const getFacilityExposurePeriod = async (startDate, endDate, type) => {
  try {
    const response = await externalApi.get(`/exposure-period/${startDate}/${endDate}/${type}`);

    return response.data;
  } catch (error) {
    console.error('TFM-API - Failed api call to getFacilityExposurePeriod %o', error);
    return { status: error?.code || 500, data: 'Failed to get facility exposure period' };
  }
};

module.exports = {
  validateToken,
  validateBank,
  getTfmTeam,
  getMandatoryCriteria,
  createApplication,
  cloneApplication,
  updateApplication,
  getApplication,
  getFacilities,
  createFacility,
  getFacility,
  updateFacility,
  deleteFacility,
  getCompanyByRegistrationNumber,
  getAddressesByPostcode,
  getUserDetails,
  setApplicationStatus,
  uploadFile,
  deleteFile,
  downloadFile,
  updateSupportingInformation,
  getAmendmentsOnDeal,
  getPortalAmendmentsOnDeal,
  getAmendment,
  upsertAmendment,
  updateAmendment,
  updateSubmitAmendment,
  updateAmendmentStatus,
  deleteAmendment,
  getTfmDeal,
  getTfmFacility,
  getFacilityExposurePeriod,
};
