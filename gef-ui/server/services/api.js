import Axios from './axios';
import { apiErrorHandler } from '../utils/helpers';

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

const getApplication = async (applicationId) => {
  try {
    const { data } = await Axios.get(`/gef/application/${applicationId}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getExporter = async (exporterId) => {
  try {
    const { data } = await Axios.get(`/gef/exporter/${exporterId}`);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const updateExporter = async (exporterId, payload) => {
  try {
    const { data } = await Axios.put(`/gef/exporter/${exporterId}`, payload);
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getFacilities = async (applicationId) => {
  if (!applicationId) {
    return [];
  }

  try {
    const { data } = await Axios.get('/gef/facilities', { params: { applicationId } });
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

const getEligibilityCriteria = async () => {
  try {
    const { data } = await Axios.get('/gef/eligibility-criteria/latest');
    return data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getCompaniesHouseDetails = async (companyRegNumber, exporterId) => {
  try {
    const { data } = await Axios.get(`/gef/company/${companyRegNumber}`, { params: { exporterId } });
    return data;
  } catch (err) {
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

export {
  validateToken,
  getMandatoryCriteria,
  createApplication,
  getEligibilityCriteria,
  getApplication,
  getExporter,
  updateExporter,
  getFacilities,
  createFacility,
  getFacility,
  updateFacility,
  getCompaniesHouseDetails,
  getAddressesByPostcode,
};
