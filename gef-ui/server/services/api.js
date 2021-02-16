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
  // const response = await Axios.get('/mandatory-criteria/latest')
  const response = {
    data: {
      htmlText: '<p>Test</p>',
    },
  };
  return response.data;
};

export {
  validateToken,
  getMandatoryCriteria,
};
