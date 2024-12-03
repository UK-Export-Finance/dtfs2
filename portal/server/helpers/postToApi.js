const generateErrorSummary = require('./generateErrorSummary');

const makeApiCall = async (query) => {
  try {
    const response = await query;
    return response;
  } catch (catchErr) {
    return catchErr;
  }
};

const isErrorResponse = (apiResponse) => apiResponse.response && apiResponse.response.status === 400;

const responseWithValidationErrors = (apiResponse, errorHref) => {
  const validationErrors = generateErrorSummary(apiResponse.response.data.validationErrors, errorHref);

  return {
    ...apiResponse.response.data,
    validationErrors,
  };
};

const postToApi = async (query, errorHref) => {
  const apiResponse = await makeApiCall(query);
  if (isErrorResponse(apiResponse)) {
    return responseWithValidationErrors(apiResponse, errorHref);
  }

  return apiResponse;
};

module.exports = postToApi;
