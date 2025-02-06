const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
const { PORTAL_FACILITY_AMENDMENT } = require('@ukef/dtfs2-common/schemas');
const { isValidMongoId, isValidBankId, isValidReportPeriod } = require('./validation/validateIds');

require('dotenv').config();

const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY, TFM_API_URL, TFM_API_KEY } = process.env;

const headers = {
  central: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': DTFS_CENTRAL_API_KEY,
  },
  tfm: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': TFM_API_KEY,
  },
};

const findOneDeal = async (dealId) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Find one deal API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
    });

    return response.data.deal;
  } catch (error) {
    console.error('Unable to find one deal %o', error);
    return false;
  }
};

const createDeal = async (deal, user, auditDetails) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals`,
      headers: headers.central,
      data: {
        deal,
        user,
        auditDetails,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

/**
 * Sends a request to DTFS Central to update a deal
 * @param {Object} params - The parameters for updating the deal.
 * @param {string} params.dealId - The ID of the deal being updated.
 * @param {Object} params.dealUpdate - The update to be made to the deal.
 * @param {Object} params.user - The user making the changes.
 * @param {Object} params.auditDetails - The audit details for the update.
 * @returns {Promise<Object | false>} The updated deal object.
 */
const updateDeal = async ({ dealId, dealUpdate, user, auditDetails }) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Update deal API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
      data: {
        dealUpdate,
        user,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update deal %o', error);
    return false;
  }
};

const deleteDeal = async (dealId, auditDetails) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Delete deal API failed for deal id %s', dealId);
      return false;
    }

    return await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
      data: {
        auditDetails,
      },
    });
  } catch (error) {
    console.error('Unable to delete deal %o', error);
    return { status: error?.code || 500, data: 'Error when deleting deal' };
  }
};

const addDealComment = async (dealId, commentType, comment, auditDetails) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Add deal comment API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/comment`,
      headers: headers.central,
      data: {
        commentType,
        comment,
        auditDetails,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to add deal comment %o', error);
    return false;
  }
};

const createFacility = async (facility, user, auditDetails) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
      headers: headers.central,
      data: {
        facility,
        user,
        auditDetails,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const createMultipleFacilities = async (facilities, dealId, user, auditDetails) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/multiple-facilities`,
      headers: headers.central,
      data: {
        facilities,
        dealId,
        user,
        auditDetails,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Find one facility API failed for facility id %s', facilityId);
      return false;
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to find one facility %o', error);
    return false;
  }
};

const updateFacility = async (facilityId, facility, user, auditDetails) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Update facility API failed for facility id %s', facilityId);
      return false;
    }

    return await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
      data: {
        facilityUpdate: facility,
        user,
        auditDetails,
      },
    });
  } catch (error) {
    console.error('Unable to update facility %o', error);
    return { status: error?.code || 500, data: 'Error when updating facility' };
  }
};

const deleteFacility = async (facilityId, user, auditDetails) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Delete facility API failed for facility id %s', facilityId);
      return false;
    }

    return await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
      data: {
        user,
        auditDetails,
      },
    });
  } catch (error) {
    console.error('Unable to delete facility %o', error);
    return { status: error?.response?.status || 500, data: 'Error when deleting facility' };
  }
};

const tfmDealSubmit = async (dealId, dealType, checker) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/submit`,
      headers: headers.tfm,
      data: {
        dealId,
        dealType,
        checker,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to submit deal %s to TFM %o', dealId, error);
    return false;
  }
};

const findLatestGefMandatoryCriteria = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/mandatory-criteria/latest`,
      headers: headers.central,
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest mandatory criteria for GEF deals %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest mandatory criteria for GEF deals' };
  }
};

/**
 * Validates utilisation report data returning any errors to display to the user
 * @param {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[]} reportData
 * @returns {Promise<import('./api-response-types').ValidateUtilisationReportDataResponseBody>} Object containing the validation errors to display to the user
 */
const validateUtilisationReportData = async (reportData) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/report-data-validation`,
      headers: headers.central,
      data: {
        reportData,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to validate utilisation report data %o', error);
    throw error;
  }
};

/**
 * Saves a utilisation report to the database
 * @param {number} reportId - The report id
 * @param {Object} reportData - The report data
 * @param {Object} user - The user object
 * @param {import('@ukef/dtfs2-common').AzureFileInfo} fileInfo - The azure file info
 * @returns {Promise<import('./api-response-types').SaveUtilisationReportResponseBody>}
 */
const saveUtilisationReport = async (reportId, reportData, user, fileInfo) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports`,
      headers: headers.central,
      data: {
        reportId,
        reportData,
        user,
        fileInfo,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to save utilisation report %o', error);
    throw error;
  }
};

/**
 * @typedef {Object} GetUtilisationReportsOptions
 * @property {import('../types/utilisation-reports').ReportPeriod} [reportPeriod] - a report period to filter reports by
 * @property {boolean} [excludeNotReceived] - whether or not to exclude reports which have not been uploaded
 */

/**
 * Gets utilisation reports for a specific bank. If a report
 * period or statuses are not provided, all reports for that bank are
 * returned. If a report period is provided, the report
 * submitted for that report period is returned. If an array of report
 * statuses are provided, the reports returned are filtered by status.
 * Returned reports are ordered by year and month ascending.
 * @param {string} bankId
 * @param {GetUtilisationReportsOptions} [options]
 * @returns {Promise<import('./api-response-types').UtilisationReportResponseBody[]>}
 */
const getUtilisationReports = async (bankId, options) => {
  const reportPeriod = options?.reportPeriod;
  const excludeNotReceived = options?.excludeNotReceived;

  try {
    if (!isValidBankId(bankId)) {
      console.error('Get utilisation reports failed with the following bank ID %s', bankId);
      throw new Error(`Invalid bank ID provided ${bankId}`);
    }

    if (reportPeriod && !isValidReportPeriod(reportPeriod)) {
      console.error('Get utilisation reports failed with the following report period %s', reportPeriod);
      throw new Error(`Invalid report period provided ${reportPeriod}`);
    }

    if (excludeNotReceived && typeof excludeNotReceived !== 'boolean') {
      console.error('Get utilisation reports failed with the following excludeNotReceived query: %s', excludeNotReceived);
      throw new Error(`Invalid excludeNotReceived provided: ${excludeNotReceived} (expected a boolean)`);
    }

    const params = { reportPeriod, excludeNotReceived };

    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/utilisation-reports`, {
      headers: headers.central,
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to get previous utilisation reports %o', error);
    throw error;
  }
};

/**
 * Gets utilisation report by id
 * @param {number} id
 * @returns {Promise<import('./api-response-types').UtilisationReportResponseBody>}
 */
const getUtilisationReportById = async (id) => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${id}`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get utilisation report with id %s: %O', id, error);
    throw error;
  }
};

/**
 * Call the central API to get a bank
 * @param {string} bankId
 * @returns {Promise<import('./api-response-types').BankResponse>} response of API call
 */
const getBankById = async (bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Invalid bank id: ${bankId}`);
  }

  const response = await axios({
    method: 'get',
    url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}`,
    headers: headers.central,
  });

  return response.data;
};

/**
 * Call the central API to get all banks
 * @returns {Promise<import('./api-response-types').BankResponse[]>} response of API call or wrapped error response
 */
const getAllBanks = async () => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/bank`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get all banks', error);
    throw error;
  }
};

/**
 * Call the central API to get the next report period for a bank
 * @param {string} bankId
 * @returns {Promise<Object>} response of API call or wrapped error response
 */
const getNextReportPeriodByBankId = async (bankId) => {
  try {
    if (!isValidBankId(bankId)) {
      console.error('Get next report period failed with the following bank ID %s', bankId);
      return false;
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/next-report-period`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get next report period by bank ID %s', error);
    return { status: error?.response?.status || 500, data: 'Failed to get next report period by bank ID' };
  }
};

/**
 * Call the central API to get the pending corrections for a bank's utilisation reports if there are any
 * @param {string} bankId
 * @returns {Promise<import('./api-response-types').UtilisationReportPendingCorrectionsResponseBody | string>} response of API call or wrapped error response
 */
const getUtilisationReportPendingCorrectionsByBankId = async (bankId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/utilisation-reports/pending-corrections`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get pending corrections: %o', error);
    throw error;
  }
};

/**
 * Gets fee record correction by id.
 * @param {number} correctionId - The ID of the correction
 * @returns {Promise<import('./api-response-types').GetFeeRecordCorrectionResponseBody>} response of API call or wrapped error response
 */
const getFeeRecordCorrectionById = async (correctionId) => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/fee-record-corrections/${correctionId}`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get fee record correction with id %s: %o', correctionId, error);
    throw error;
  }
};

/**
 * Gets completed fee record corrections by bank id.
 * @param {number} bankId - The ID of the bank
 * @returns {Promise<import('./api-response-types').GetCompletedFeeRecordCorrectionsResponseBody>} response of API call or wrapped error response
 */
const getCompletedFeeRecordCorrections = async (bankId) => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/utilisation-reports/completed-corrections`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get completed fee record corrections for bank with id %s: %o', bankId, error);
    throw error;
  }
};

/**
 * Saves a fee record correction.
 *
 * The user id is sent in the body as saving uses the current
 * users saved fee record correction transient form data.
 *
 * @param {string} bankId - The ID of the bank
 * @param {number} correctionId - The ID of the correction
 * @param {string} userId - The ID of the user
 * @returns {Promise<import('./api-response-types').SaveFeeRecordCorrectionResponseBody>} response of API call
 */
const saveFeeRecordCorrection = async (bankId, correctionId, userId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/fee-record-corrections/${correctionId}`,
      headers: headers.central,
      data: {
        user: { _id: userId },
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to save fee record correction with id %s and bank id %s: %o', correctionId, bankId, error);
    throw error;
  }
};

/**
 * Gets fee record correction transient form data by correction id and user id.
 * @param {number} correctionId - The ID of the correction
 * @param {string} userId - The ID of the user
 * @returns {Promise<import('./api-response-types').GetFeeRecordCorrectionTransientFormDataResponseBody>} response of API call
 */
const getFeeRecordCorrectionTransientFormData = async (correctionId, userId) => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/fee-record-corrections/${correctionId}/transient-form-data/${userId}`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get fee record correction transient form data with correction id %s and user id %s: %o', correctionId, userId, error);
    throw error;
  }
};

/**
 * Puts fee record correction transient form data by bank id, correction id, and user id.
 * @param {string} bankId - The ID of the bank
 * @param {number} correctionId - The ID of the correction
 * @param {string} userId - The ID of the user
 * @param {import('@ukef/dtfs2-common').RecordCorrectionFormValues} formData - The form data
 * @returns {Promise<import('./api-response-types').PutFeeRecordCorrectionResponseBody>} Promise that resolves to the put fee record correction response
 */
const putFeeRecordCorrectionTransientFormData = async (bankId, correctionId, userId, formData) => {
  try {
    const response = await axios.put(
      `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/fee-record-corrections/${correctionId}/transient-form-data`,
      {
        formData,
        user: { _id: userId },
      },
      {
        headers: headers.central,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      'Unable to put fee record correction transient form data with bank id %s, correction id %s, and user id %s: %o',
      bankId,
      correctionId,
      userId,
      error,
    );

    throw error;
  }
};

/**
 * Deletes a fee record correction transient form data for the user by correction id.
 * @param {number} correctionId - The ID of the correction
 * @param {string} userId - The ID of the user
 */
const deleteFeeRecordCorrectionTransientFormData = async (correctionId, userId) => {
  await axios({
    method: 'delete',
    url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/fee-record-corrections/${correctionId}/transient-form-data/${userId}`,
    headers: headers.central,
  });
};

/**
 * Gets the portal facility amendment
 * @param {string} facilityId - id of the facility to amend
 * @param {string} amendmentId - id of the facility amendment
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the amendment
 */
const getPortalFacilityAmendment = async (facilityId, amendmentId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting portal facility amendment with facility id %s and amendment id %s: %o', facilityId, amendmentId, error);
    throw error;
  }
};

/**
 * Upserts a draft amendment for a portal facility in the database.
 * @param {Object} params
 * @param {string} params.dealId - id of the deal with the relevant facility.
 * @param {string} params.facilityId - id of the facility to amend.
 * @param {import('@ukef/dtfs2-common').PortalFacilityAmendmentUserValues} params.amendment - the draft amendment to be upserted.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the amendment
 */
const putPortalFacilityAmendment = async ({ dealId, facilityId, amendment, auditDetails }) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments`,
      headers: headers.central,
      data: {
        dealId,
        facilityId,
        amendment,
        auditDetails,
      },
    });

    const { success, error, data } = PORTAL_FACILITY_AMENDMENT.safeParse(response.data);

    if (success) {
      return data;
    }

    console.error('Type validation error occurred when receiving portal amendment from dtfs-central %o', error);

    throw new Error('Type validation error occurred');
  } catch (error) {
    console.error('Error upserting portal facility amendment for facility with id %s: with amendment details: %o, %o', facilityId, amendment, error);
    throw error;
  }
};

/**
 * Upserts a draft amendment for a portal facility in the database.
 * @param {Object} params
 * @param {string} params.amendmentId - the amendment id.
 * @param {string} params.facilityId - the facility id
 * @param {(import('@ukef/dtfs2-common').PortalFacilityAmendmentStatus)} params.newStatus - the facility id
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the updatedamendment
 */
const patchPortalFacilityAmendmentStatus = async ({ facilityId, amendmentId, auditDetails, newStatus }) => {
  try {
    const response = await axios({
      method: 'patch',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}/status`,
      headers: headers.central,
      data: {
        facilityId,
        newStatus,
        auditDetails,
      },
    });

    const { success, error, data } = PORTAL_FACILITY_AMENDMENT.safeParse(response.data);

    if (success) {
      return data;
    }

    console.error('Type validation error occurred when receiving portal amendment from dtfs-central %o', error);

    throw new Error('Type validation error occurred');
  } catch (error) {
    console.error('Error updating the status of amendment with id %s on facility with id %s: %o', amendmentId, facilityId, error);
    throw error;
  }
};

/**
 * Gets fee record correction review information by correction id and user id.
 * @param {number} correctionId - The ID of the correction
 * @param {string} userId - The ID of the user
 * @returns {Promise<import('@ukef/dtfs2-common').FeeRecordCorrectionReviewInformation>} response of API call or wrapped error response
 */
const getFeeRecordCorrectionReview = async (correctionId, userId) => {
  try {
    const response = await axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/fee-record-correction-review/${correctionId}/user/${userId}`, {
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to get fee record correction review (correction id: %s, user id: %s): %o', correctionId, userId, error);
    throw error;
  }
};

/**
 * Updates a portal facility amendment with the provided details.
 * @param {Object} params
 * @param {string} params.facilityId - id of the facility to amend.
 * @param {string} params.amendmentId - id of the amendment.
 * @param {import('@ukef/dtfs2-common').PortalFacilityAmendmentUserValues} params.update - the updates to amend the amendment with.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the amendment
 */
const patchPortalFacilityAmendment = async ({ facilityId, amendmentId, update, auditDetails }) => {
  try {
    const response = await axios({
      method: 'patch',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: headers.central,
      data: {
        facilityId,
        amendmentId,
        update,
        auditDetails,
      },
    });

    const { success, error, data } = PORTAL_FACILITY_AMENDMENT.safeParse(response.data);

    if (success) {
      return data;
    }

    console.error('Type validation error occurred when receiving portal amendment from dtfs-central %o', error);

    throw new Error('Type validation error occurred');
  } catch (error) {
    console.error(
      'Error updating portal facility amendment with id %s for facility with id %s with the following update %o, %o',
      amendmentId,
      facilityId,
      update,
      error,
    );
    throw error;
  }
};

module.exports = {
  findOneDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  addDealComment,
  createFacility,
  createMultipleFacilities,
  findOneFacility,
  updateFacility,
  deleteFacility,
  tfmDealSubmit,
  findLatestGefMandatoryCriteria,
  validateUtilisationReportData,
  saveUtilisationReport,
  getUtilisationReports,
  getUtilisationReportById,
  getBankById,
  getAllBanks,
  getNextReportPeriodByBankId,
  getUtilisationReportPendingCorrectionsByBankId,
  getFeeRecordCorrectionById,
  deleteFeeRecordCorrectionTransientFormData,
  saveFeeRecordCorrection,
  getFeeRecordCorrectionTransientFormData,
  getPortalFacilityAmendment,
  putPortalFacilityAmendment,
  getFeeRecordCorrectionReview,
  patchPortalFacilityAmendment,
  patchPortalFacilityAmendmentStatus,
  putFeeRecordCorrectionTransientFormData,
  getCompletedFeeRecordCorrections,
};
