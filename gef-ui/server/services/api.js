const FormData = require('form-data');
const Axios = require('./axios');
const { apiErrorHandler } = require('../utils/helpers');
const { isValidMongoId, isValidUkPostcode, isValidCompaniesHouseNumber } = require('../utils/validateIds');

const config = (userToken) => ({ headers: { Authorization: userToken } });

const validateToken = async (userToken) => {
  try {
    const { status } = await Axios.get('/validate', config(userToken));
    return status === 200;
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
    return { status: error?.response?.status || 500, data: 'Failed to validate bank' };
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
      { ...config(userToken), timeout: 10000 },
    ); // Application status has multiple api calls in portal api
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

const getCompaniesHouseDetails = async ({ companyRegNumber, userToken }) => {
  if (!isValidCompaniesHouseNumber(companyRegNumber)) {
    console.error('getCompaniesHouseDetails: API call failed for companyRegNumber %s', companyRegNumber);
    throw new Error('Invalid company house number');
  }

  try {
    const { data } = await Axios.get(`/gef/company/${companyRegNumber}`, config(userToken));
    return data;
  } catch (error) {
    console.error('Unable to get company house details %o', error?.response?.data);
    return apiErrorHandler(error);
  }
};

const getAddressesByPostcode = async ({ postcode, userToken }) => {
  if (!isValidUkPostcode(postcode)) {
    console.error('getAddressesByPostcode: API call failed for postcode %s', postcode);
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
  getCompaniesHouseDetails,
  getAddressesByPostcode,
  getUserDetails,
  setApplicationStatus,
  uploadFile,
  deleteFile,
  downloadFile,
  updateSupportingInformation,
};
