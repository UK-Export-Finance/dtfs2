const FormData = require('form-data');
const Axios = require('./axios');
const { apiErrorHandler } = require('../utils/helpers');

const validateToken = async (token) => {
  try {
    Axios.defaults.headers.common.Authorization = token;
    const { status } = await Axios.get('/validate');
    return status === 200;
  } catch (err) {
    return false;
  }
};

const getMandatoryCriteria = async () => {
  try {
    const { data } = await Axios.get('/gef/mandatory-criteria-versioned/latest');
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const createApplication = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/application', payload);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const cloneApplication = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/application/clone', payload);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getApplication = async (dealId) => {
  try {
    const { data } = await Axios.get(`/gef/application/${dealId}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const updateApplication = async (dealId, application) => {
  try {
    const { data } = await Axios.put(`/gef/application/${dealId}`, application);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const updateSupportingInformation = async (dealId, application, field, user) => {
  try {
    const { data } = await Axios.put(`/gef/application/supporting-information/${dealId}`, { application, field, user });
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const setApplicationStatus = async (dealId, status) => {
  try {
    const { data } = await Axios.put(`/gef/application/status/${dealId}`, {
      status,
    }, { timeout: 10000 }); // Application status has multiple api calls in portal api
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getFacilities = async (dealId) => {
  if (!dealId) {
    return [];
  }

  try {
    const { data } = await Axios.get('/gef/facilities', { params: { dealId } });
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const createFacility = async (payload) => {
  try {
    const { data } = await Axios.post('/gef/facilities', payload);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getFacility = async (facilityId) => {
  try {
    const { data } = await Axios.get(`/gef/facilities/${facilityId}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const updateFacility = async (facilityId, payload) => {
  try {
    const { data } = await Axios.put(`/gef/facilities/${facilityId}`, payload);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const deleteFacility = async (facilityId) => {
  try {
    const { data } = await Axios.delete(`/gef/facilities/${facilityId}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getEligibilityCriteria = async () => {
  try {
    const { data } = await Axios.get('/gef/eligibility-criteria/latest');
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getCompaniesHouseDetails = async (companyRegNumber) => {
  try {
    const { data } = await Axios.get(`/gef/company/${companyRegNumber}`);
    return data;
  } catch (err) {
    console.error('Unable to get company house details', { err });
    return apiErrorHandler(err);
  }
};

const getAddressesByPostcode = async (postcode) => {
  try {
    const { data } = await Axios.get(`/gef/address/${postcode}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};
const getUserDetails = async (id, token) => {
  if (!token || !id) return false;

  try {
    const { data } = await Axios.get(`/users/${id}`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const uploadFile = async (files, id, token, maxSize, documentPath) => {
  if (!files?.length || !id || !token) return false;

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
  } catch (err) {
    console.error(err);
    return apiErrorHandler(err);
  }
};

const deleteFile = async (fileId, token, documentPath) => {
  try {
    const { data } = await Axios.delete(`/gef/files/${fileId}`, {
      data: { documentPath },
      headers: { Authorization: token },
    });
    return data;
  } catch (err) {
    console.error('Unable to delete the file', { err });
    return apiErrorHandler(err);
  }
};

const downloadFile = async (fileId, token) => {
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
  } catch (err) {
    console.error('Unable to download the file', err);
    return apiErrorHandler(err);
  }
};

module.exports = {
  validateToken,
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
