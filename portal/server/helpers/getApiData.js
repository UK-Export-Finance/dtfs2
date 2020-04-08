const makeApiCall = async (query) => {
  try {
    const result = await query;
    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

// could have similar 'postApiData' and handle form error responses/mappings on catch
const getApiData = (query, res) => new Promise((resolve) =>
  makeApiCall(query).then((data) => resolve(data))
    .catch((err) => { // eslint-disable-line
      // currently assuming all api GET errors are auth errors,
      // redirect to login
      // unauth handling could be middleware
      return res.redirect('/');
    }));

export default getApiData;
