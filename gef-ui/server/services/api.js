import Axios from './axios';
import { errorHandler } from '../utils/helpers';

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
    const response = await Axios.get('/g');
    return response.data;
  } catch (err) {
    console.log('BABY', err);
    return errorHandler(err);
  }
};

export {
  validateToken,
  getMandatoryCriteria,
};
