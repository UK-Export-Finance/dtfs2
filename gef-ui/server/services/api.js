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
    // const response = await Axios.get('/gef/automatic-cover-versioned/latest');
    const response = {
      data: {
        version: 123,
        items: [
          {
            id: 'coverStart',
            htmlText: '<p>12. The period between the Cover Start Date and the  Cover End Date does not exceed the Facility Maximum Cover Period.</p>',
            errMsg: '12. Select if the Maximum Cover period has been exceeded',
          },
          {
            id: 'noticeDate',
            htmlText: '<p>13. The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months or such longer period as may be agreed by UKEF.</p>',
            errMsg: '13. Select if the period between the includsion Notice Date and the Requested Cover Start Date exceeds 3 months or any other period agreed by UKEF',
          },
          {
            id: 'facilityLimit',
            htmlText: `<p>14.  The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:</p>
                    <p>(i) the Available Master Guarantee Limit 
                    (ii) the Available Obligor’s limit</p>`,
            errMsg: '14. Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
          },
        ],
      },
    };
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
