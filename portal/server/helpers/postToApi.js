const makeApiCall = async (query) => {
  try {
    const response = await query;
    return response;
  } catch (catchErr) {
    return catchErr;
  }
};

// TODO: generate and return validationErrors object here?
const postToApi = (query) => new Promise((resolve, reject) =>
  makeApiCall(query).then((apiResponse) => {
    if (apiResponse.response && apiResponse.response.status === 400) {
      return reject(apiResponse.response.data);
    }
    return resolve(apiResponse);
  }).catch((err) => err));

export default postToApi;
