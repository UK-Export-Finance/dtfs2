import Axios from './axios';
import { apiErrorHandler } from '../utils/helpers';

const validateToken = async (token) => {
  try {
    Axios.defaults.headers.common.Authorization = token;
    const response = await Axios.get('/validate');
    return response.status === 200;
  } catch (err) {
    return false;
  }
};

const getMandatoryCriteria = async () => {
  try {
    const response = await Axios.get('/gef/mandatory-criteria-versioned/latest');
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const createApplication = async (payload) => {
  try {
    const response = await Axios.post('/gef/application', payload);
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getApplication = async (applicationId) => {
  try {
    const response = await Axios.get(`/gef/application/${applicationId}`);
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getExporter = async (exporterId) => {
  try {
    const response = await Axios.get(`/gef/exporter/${exporterId}`);
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getFacilities = async (applicationId) => {
  if (!applicationId) {
    return [];
  }

  try {
    const response = await Axios.get('/gef/facilities', { params: { applicationId } });
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

const getAutomaticCover = async () => {
  try {
    const response = await Axios.get('/gef/automatic-cover-versioned/latest');
    return response.data;
  } catch (err) {
    return apiErrorHandler(err);
  }
};

export {
  validateToken,
  getMandatoryCriteria,
  createApplication,
  getAutomaticCover,
  getApplication,
  getExporter,
  getFacilities,
};
