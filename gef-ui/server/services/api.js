const FormData = require('form-data');
const { isValidCompanyRegistrationNumber } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const Axios = require('./axios');
const { apiErrorHandler } = require('../utils/helpers');
const { isValidMongoId, isValidUkPostcode } = require('../utils/validateIds');

const config = (userToken) => ({ headers: { Authorization: userToken } });

const validateToken = async (userToken) => {
  try {
    const { status } = await Axios.get('/validate', config(userToken));
    return status === HttpStatusCode.Ok;
  } catch (error) {
    return false;
  }
};

const validateBank = async ({ dealId, bankId, userToken }) => {
  try {
    const { data } = await Axios.get('/validate/bank', { ...config(userToken), data: { dealId, bankId } });
    return data;
  } catch (error) {
    console.error('Unable to validate the bank %o', error);
    return { status: error?.response?.status || HttpStatusCode.InternalServerError, data: 'Failed to validate bank' };
  }
};

const getMandatoryCriteria = async ({ userToken }) => {
  try {
    const { data } = await Axios.get('/gef/mandatory-criteria-versioned/latest', config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const createApplication = async ({ payload, userToken }) => {
  try {
    const { data } = await Axios.post('/gef/application', payload, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const cloneApplication = async ({ payload, userToken }) => {
  try {
    const { data } = await Axios.post('/gef/application/clone', payload, config(userToken));
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
    const { data } = await Axios.get(`/gef/application/${dealId}`, config(userToken));
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
    const { data } = await Axios.put(`/gef/application/${dealId}`, application, config(userToken));
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
    const { data } = await Axios.put(`/gef/application/supporting-information/${dealId}`, { application, field, user }, config(userToken));
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
    const { data } = await Axios.put(
      `/gef/application/status/${dealId}`,
      {
        status,
      },
      { ...config(userToken), timeout: 30000 },
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
    const { data } = await Axios.get('/gef/facilities', { ...config(userToken), params: { dealId } });
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const createFacility = async ({ payload, userToken }) => {
  try {
    const { data } = await Axios.post('/gef/facilities', payload, config(userToken));
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
    const { data } = await Axios.get(`/gef/facilities/${facilityId}`, config(userToken));
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
    const { data } = await Axios.put(`/gef/facilities/${facilityId}`, payload, config(userToken));
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
    const { data } = await Axios.delete(`/gef/facilities/${facilityId}`, config(userToken));
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

    const { data } = await Axios.get(`/gef/companies/${registrationNumber}`, config(userToken));

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
    const { data } = await Axios.get(`/gef/address/${postcode}`, config(userToken));
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getUserDetails = async ({ userId, userToken }) => {
  if (!userToken || !userId) {
    return false;
  }

  if (!isValidMongoId(userId)) {
    console.error('getUserDetails API call failed for id %s', userId);
    return false;
  }

  try {
    const { data } = await Axios.get(`/users/${userId}`, config(userToken));
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
    const { data } = await Axios.post('/gef/files/', formData, {
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
    const { data } = await Axios.delete(`/gef/files/${fileId}`, {
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
    const { data } = await Axios({
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

module.exports = {
  validateToken,
  validateBank,
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
};
