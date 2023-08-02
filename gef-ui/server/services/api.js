const FormData = require('form-data');
const Axios = require('./axios');
const { apiErrorHandler } = require('../utils/helpers');
const { isValidMongoId, isValidUkPostcode, isValidCompaniesHouseNumber } = require('../utils/validateIds');

const validateToken = async (token) => {
  try {
    Axios.defaults.headers.common.Authorization = token;
    const { status } = await Axios.get('/validate');
    return status === 200;
  } catch (error) {
    return false;
  }
};

const validateBank = async (dealId, bankId) => {
  try {
    const { data } = await Axios.get('/validate/bank', { data: { dealId, bankId } });
    return data;
  } catch (error) {
    console.error('Unable to validate the bank %O', error);
    return { status: error?.response?.status || 500, data: 'Failed to validate bank' };
  }
};

const getMandatoryCriteria = async () => {
  try {
    const { data } = await Axios.get('/gef/mandatory-criteria-versioned/latest');
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const createApplication = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/application', payload);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const cloneApplication = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/application/clone', payload);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getApplication = async (dealId) => {
  if (!isValidMongoId(dealId)) {
    console.error('getApplication: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await Axios.get(`/gef/application/${dealId}`);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateApplication = async (dealId, application) => {
  if (!isValidMongoId(dealId)) {
    console.error('updateApplication: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await Axios.put(`/gef/application/${dealId}`, application);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateSupportingInformation = async (dealId, application, field, user) => {
  if (!isValidMongoId(dealId)) {
    console.error('updateSupportingInformation: API call failed for dealId %s', dealId);
    return false;
  }

  try {
    const { data } = await Axios.put(`/gef/application/supporting-information/${dealId}`, { application, field, user });
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const setApplicationStatus = async (dealId, status) => {
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
      { timeout: 10000 },
    ); // Application status has multiple api calls in portal api
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getFacilities = async (dealId) => {
  if (!dealId) {
    return [];
  }

  try {
    const { data } = await Axios.get('/gef/facilities', { params: { dealId } });
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const createFacility = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/facilities', payload);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getFacility = async (facilityId) => {
  if (!isValidMongoId(facilityId)) {
    console.error('getFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await Axios.get(`/gef/facilities/${facilityId}`);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const updateFacility = async (facilityId, payload) => {
  if (!isValidMongoId(facilityId)) {
    console.error('updateFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await Axios.put(`/gef/facilities/${facilityId}`, payload);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const deleteFacility = async (facilityId) => {
  if (!isValidMongoId(facilityId)) {
    console.error('deleteFacility: API call failed for facilityId %s', facilityId);
    return false;
  }

  try {
    const { data } = await Axios.delete(`/gef/facilities/${facilityId}`);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getEligibilityCriteria = async () => {
  try {
    const { data } = await Axios.get('/gef/eligibility-criteria/latest');
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getCompaniesHouseDetails = async (companyRegNumber) => {
  if (!isValidCompaniesHouseNumber(companyRegNumber)) {
    console.error('getCompaniesHouseDetails: API call failed for companyRegNumber %s', companyRegNumber);
    throw new Error('Invalid company house number');
  }

  try {
    const { data } = await Axios.get(`/gef/company/${companyRegNumber}`);
    return data;
  } catch (error) {
    console.error('Unable to get company house details %O', error?.response?.data);
    return apiErrorHandler(error);
  }
};

const getAddressesByPostcode = async (postcode) => {
  if (!isValidUkPostcode(postcode)) {
    console.error('getAddressesByPostcode: API call failed for postcode %s', postcode);
    throw new Error('Invalid postcode');
  }

  try {
    const { data } = await Axios.get(`/gef/address/${postcode}`);
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const getUserDetails = async (id, token) => {
  if (!token || !id) {
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('getUserDetails API call failed for id %s', id);
    return false;
  }

  try {
    const { data } = await Axios.get(`/users/${id}`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (error) {
    return apiErrorHandler(error);
  }
};

const uploadFile = async (files, id, token, maxSize, documentPath) => {
  if (!files?.length || !id || !token) {
    console.error('uploadFile: API call failed for id %s, number of files %s, token %s', id, files?.length, token);
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('uploadFile API call failed for id %s', id);
    return false;
  }

  const formData = new FormData();

  formData.append('parentId', id);
  if (maxSize) formData.append('maxSize', maxSize);

  formData.append('documentPath', documentPath);
  files.forEach((file) => {
    formData.append(file.fieldname, file.buffer, file.originalname);
  });

  const formHeaders = formData.getHeaders();

  try {
    const { data } = await Axios.post('/gef/files/', formData, {
      headers: {
        Authorization: token,
        ...formHeaders,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return data;
  } catch (error) {
    console.error('GEF-UI - Error uploading file %O', error);
    return apiErrorHandler(error);
  }
};

const deleteFile = async (fileId, token, documentPath) => {
  try {
    const { data } = await Axios.delete(`/gef/files/${fileId}`, {
      data: { documentPath },
      headers: { Authorization: token },
    });
    return data;
  } catch (error) {
    console.error('Unable to delete the file %O', error);
    return apiErrorHandler(error);
  }
};

const downloadFile = async (fileId, token) => {
  if (!isValidMongoId(fileId)) {
    console.error('downloadFile: API call failed for fileId %s', fileId);
    return false;
  }

  try {
    const { data } = await Axios({
      method: 'get',
      responseType: 'stream',
      url: `/gef/files/${fileId}/download`,
      headers: {
        Authorization: token,
      },
    });
    return data;
  } catch (error) {
    console.error('Unable to download the file %O', error);
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
  getEligibilityCriteria,
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
