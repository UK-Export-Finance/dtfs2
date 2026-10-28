const { LANDING_PAGES } = require('../constants');

const makeApiCall = async (query) => {
  try {
    const result = await query;

    if (result.networkError && result.networkError.statusCode === 401) {
      throw new Error(result.networkError);
    }

    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

// could have similar 'postApiData' and handle form error responses/mappings on catch
const getApiData = (query, res) =>
  new Promise((resolve) =>
    makeApiCall(query)
      .then((data) => resolve(data))
      .catch((error) => {
        // currently assuming all api GET errors are auth errors,
        // redirect to login
        // un-authentication handling could be middleware
        console.info(error);
        return res.redirect(LANDING_PAGES.LOGIN);
      }),
  );

module.exports = getApiData;
