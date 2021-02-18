import httpError from 'http-errors';

const parseBool = (params) => !(
  params === 'false'
    || params === '0'
    || params === ''
    || params === undefined
);

const userToken = (req) => {
  const token = req.session.userToken;
  return token;
};

const errorHandler = (error) => {
  if (error.code === 'ECONNABORTED') {
    return httpError(501, 'Request timed out.');
  }

  return httpError(error.response.status, error.response.statusText);
};

export {
  parseBool,
  userToken,
  errorHandler,
};
