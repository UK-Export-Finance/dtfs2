const axios = require('axios');
const { ObjectId } = require('mongodb');

const { TIMEOUT, HEADERS } = require('@ukef/dtfs2-common');
const { PORTAL_FACILITY_AMENDMENT } = require('@ukef/dtfs2-common/schemas');
const { isValidMongoId, isValidBankId, isValidReportPeriod } = require('./validation/validateIds');
const { InvalidDatabaseQueryError } = require('./errors/invalid-database-query.error');

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
 * @param {object} params - The parameters for updating the deal.
 * @param {string} params.dealId - The ID of the deal being updated.
 * @param {object} params.dealUpdate - The update to be made to the deal.
 * @param {object} params.user - The user making the changes.
 * @param {object} params.auditDetails - The audit details for the update.
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

/**
 * finds and returns gef facilities on a deal
 * @param {string} dealId
 * @returns {Facility[]} array of facilities on deal
 */
const findGefFacilitiesByDealId = async (dealId) => {
  if (!ObjectId.isValid(dealId)) {
    throw new InvalidDatabaseQueryError('Invalid deal id');
  }

  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/deals/${dealId}/facilities`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to find facilities for deal ID %s %o', dealId, error);
    return { status: error?.code || 500, data: 'Error when finding facilities by dealId' };
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

/**
 * Submits a deal to the TFM API.
 *
 * @async
 * @function tfmDealSubmit
 * @param {string} dealId - The unique identifier of the deal to be submitted.
 * @param {string} dealType - The type of the deal being submitted.
 * @param {object} checker - The checker object containing details of the user submitting the deal.
 * @returns {Promise<Object|boolean>} The response data from the TFM API if successful, or `false` if an error occurs.
 */
const tfmDealSubmit = async (dealId, dealType, checker) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/submit`,
      headers: headers.tfm,
      timeout: TIMEOUT.LONG,
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
 * @param {object} reportData - The report data
 * @param {object} user - The user object
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
 * @typedef {object} GetUtilisationReportsOptions
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
 * @returns {Promise<object>} response of API call or wrapped error response
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
 * Gets portal facility amendments filtered by status
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus[] | undefined} statuses - an optional array of statuses to filter the amendments by
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId[])>} - the amendments on the deal with a matching status
 */
const getAllPortalFacilityAmendments = async (statuses) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/amendments`,
      params: { statuses },
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting all portal facility amendments %o', error);
    throw error;
  }
};

/**
 * Gets the latest value and cover end date from the latest amendment of either
 * @param {string} facilityId - id of the facility to amend
 * @returns {Promise<(import('@ukef/dtfs2-common').LatestAmendmentValueAndCoverEndDate)>} - the latest cover end date and facility value
 */
const getLatestAmendmentFacilityValueAndCoverEndDate = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/latest-value-and-cover-end-date`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting latest value and cover end date for the facility %s: %o', facilityId, error);
    throw error;
  }
};

/**
 * Gets portal facility amendments by facility id with status 'acknowledged'
 * @param {string} facilityId - id of the facility to amend
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId[])>} - the amendments on facility with the status 'acknowledged'
 */
const getAcknowledgedAmendmentsByFacilityId = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/acknowledged`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting acknowledged portal facility amendments for facility ID %s %o', facilityId, error);
    throw error;
  }
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
 * Gets all type facility amendments on the deal filtered by status
 * @param {string} dealId - id of the facility to amend
 * @param {(import('@ukef/dtfs2-common').PortalAmendmentStatus | import('@ukef/dtfs2-common').TfmAmendmentStatus)[] | undefined} statuses - an optional array of statuses to filter the amendments by
 * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAmendmentWithUkefId[])>} - the amendments on the deal with a matching status
 */
const getFacilityAmendmentsOnDeal = async (dealId, statuses) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/all-types-amendments`,
      params: { statuses },
      headers: headers.central,
    });

    if (!response?.data) {
      throw new Error('Invalid response received');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting facility amendments on deal with id %s %o', dealId, error);
    throw error;
  }
};

/**
 * Gets portal facility amendments on the deal filtered by status
 * @param {string} dealId - id of the facility to amend
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus[] | undefined} statuses - an optional array of statuses to filter the amendments by
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId[])>} - the amendments on the deal with a matching status
 */
const getPortalFacilityAmendmentsOnDeal = async (dealId, statuses) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/amendments`,
      params: { statuses },
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting portal facility amendments on deal with id %s: %o', dealId, error);
    throw error;
  }
};

/**
 * Upserts a draft amendment for a portal facility in the database.
 * @param {object} params
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
 * Update portal facility amendment status.
 * @param {object} params
 * @param {string} params.facilityId - the facility id
 * @param {string} params.amendmentId - the amendment id.
 * @param {(import('@ukef/dtfs2-common').PortalAmendmentStatus)} params.newStatus - the facility id
 * @param {string} params.referenceNumber - the amendment reference number
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @param {string} params.makersEmail - The maker's email address to send the notification to
 * @param {string} params.checkersEmail - The checker's email address to send the notification to
 * @param {string} params.pimEmail - The pim's email address to send the notification to
 * @param {import('@ukef/dtfs2-common').PortalAmendmentSubmittedToUkefEmailVariables} params.emailVariables - The email variables to send with the notification
 * @param {number} params.requestDate - The date the bank requested the amendment - the date it was submitted to UKEF.
 * @param {string} params.bankId - The bank id
 * @param {string} params.bankName - The bank name
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the updatedamendment
 */
const patchPortalFacilitySubmitAmendment = async ({
  facilityId,
  amendmentId,
  newStatus,
  referenceNumber,
  auditDetails,
  makersEmail,
  checkersEmail,
  pimEmail,
  emailVariables,
  requestDate,
  bankId,
  bankName,
}) => {
  try {
    const response = await axios({
      method: 'patch',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment`,
      headers: headers.central,
      data: {
        newStatus,
        referenceNumber,
        auditDetails,
        makersEmail,
        checkersEmail,
        pimEmail,
        emailVariables,
        requestDate,
        bankId,
        bankName,
      },
    });

    const { success, error, data } = PORTAL_FACILITY_AMENDMENT.safeParse(response.data);

    if (success) {
      return data;
    }

    console.error('Type validation error occurred when receiving portal amendment from dtfs-central %o', error);

    throw new Error('Type validation error occurred');
  } catch (error) {
    console.error('Error updating the amendment with id %s on facility with id %s: %o', amendmentId, facilityId, error);
    throw error;
  }
};

/**
 * Update portal facility amendment status.
 * @param {object} params
 * @param {string} params.facilityId - the facility id
 * @param {string} params.amendmentId - the amendment id.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @param {(import('@ukef/dtfs2-common').PortalAmendmentStatus)} params.newStatus - the facility id
 * @param {string} params.makersEmail - The maker's email address to send the notification to
 * @param {string} params.checkersEmail - The checker's email address to send the notification to
 * @param {import('@ukef/dtfs2-common').PortalAmendmentSubmittedToCheckerEmailVariables | import('@ukef/dtfs2-common').PortalAmendmentReturnToMakerEmailVariables} params.emailVariables - The email variables to send with the notification
 * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} - the updatedamendment
 */
const patchPortalFacilityAmendmentStatus = async ({ facilityId, amendmentId, auditDetails, newStatus, makersEmail, checkersEmail, emailVariables }) => {
  try {
    const response = await axios({
      method: 'patch',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}/status`,
      headers: headers.central,
      data: {
        newStatus,
        makersEmail,
        checkersEmail,
        auditDetails,
        emailVariables,
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
 * @param {object} params
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

/**
 * Delete a portal facility amendment with the provided details.
 * @param {object} params
 * @param {string} params.facilityId - id of the facility to amend.
 * @param {string} params.amendmentId - id of the amendment.
 * @param {import('@ukef/dtfs2-common').AuditDetails} params.auditDetails - The audit details for the update.
 * @param {string} params.makersEmail - The maker's email address to send the notification to
 * @param {string} params.checkersEmail - The checker's email address to send the notification to
 * @param {import('@ukef/dtfs2-common').PortalAmendmentAbandonEmailVariables} params.emailVariables - The email variables to send with the notification
 * @returns {Promise<void>}
 */
const deletePortalFacilityAmendment = async (facilityId, amendmentId, auditDetails, makersEmail, checkersEmail, emailVariables) => {
  try {
    await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}/amendments/${amendmentId}`,
      headers: headers.central,
      data: {
        auditDetails,
        makersEmail,
        checkersEmail,
        emailVariables,
      },
    });
  } catch (error) {
    console.error('Error deleting portal facility amendment with facility ID %s and amendment ID %s %o', facilityId, amendmentId, error);
    throw error;
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
const getTfmTeam = async (teamId) => {
  try {
    return await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`,
      headers: headers.central,
    });
  } catch (error) {
    console.error('Unable to get the TFM team with ID %s %o', teamId, error);
    return { status: error?.code || axios.HttpStatusCode.InternalServerError, data: 'Unable to get the TFM team' };
  }
};

/**
 * Retrieves the TFM deal from `tfm-deals` collection.
 *
 * @async
 * @function getTfmDeal
 * @param {string} dealId - Mongo identifier of the TFM deal to retrieve.
 * @returns {Promise<object>} The Axios response object if successful, or an error object with status and data if failed.
 */
const getTfmDeal = async (dealId) => {
  try {
    return await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`,
      headers: headers.central,
    });
  } catch (error) {
    console.error('Unable to get the TFM deal with ID %s %o', dealId, error);
    return { status: error?.code || axios.HttpStatusCode.InternalServerError, data: 'Unable to get the TFM deal' };
  }
};

/**
 * Retrieves the TFM facility from `tfm-facilities` collection.
 *
 * @async
 * @function getTfmDeal
 * @param {string} facilityId - Mongo identifier of the TFM facility to retrieve.
 * @returns {Promise<Object>} The Axios response object if successful, or an error object with status and data if failed.
 */
const getTfmFacility = async (facilityId) => {
  try {
    return await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/tfm/facilities/${facilityId}`,
      headers: headers.central,
    });
  } catch (error) {
    console.error('Unable to get the TFM facility with ID %s %o', facilityId, error);
    return { status: error?.code || axios.HttpStatusCode.InternalServerError, data: 'Unable to get the TFM facility' };
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
  findGefFacilitiesByDealId,
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
  getAllPortalFacilityAmendments,
  getFacilityAmendmentsOnDeal,
  getPortalFacilityAmendment,
  getLatestAmendmentFacilityValueAndCoverEndDate,
  getAcknowledgedAmendmentsByFacilityId,
  getPortalFacilityAmendmentsOnDeal,
  putPortalFacilityAmendment,
  getFeeRecordCorrectionReview,
  patchPortalFacilityAmendment,
  patchPortalFacilitySubmitAmendment,
  patchPortalFacilityAmendmentStatus,
  putFeeRecordCorrectionTransientFormData,
  deletePortalFacilityAmendment,
  getCompletedFeeRecordCorrections,
  getTfmTeam,
  getTfmDeal,
  getTfmFacility,
};
