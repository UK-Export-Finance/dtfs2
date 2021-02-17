import Axios from './axios';

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
    return err;
  }
};

export {
  validateToken,
  getMandatoryCriteria,
};
