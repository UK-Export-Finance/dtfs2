const makeApiCall = async (query) => {
  try {
    const result = await query;
    console.log('123');
    console.log(result);
    if (result.networkError && result.networkError.statusCode === 401) {
      throw new Error(result.networkError);
    }
    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

// could have similar 'postApiData' and handle form error responses/mappings on catch
const getApiData = (query, res) => new Promise((resolve) =>
  // eslint-disable-next-line no-promise-executor-return
  makeApiCall(query).then((data) => resolve(data))
    .catch((err) => { // eslint-disable-line
      // currently assuming all api GET errors are auth errors,
      // redirect to login
      // unauth handling could be middleware
      console.log('23523');
      console.log(err);
      console.log('23523');
      console.log(query);
      console.log('23523');
      console.log(res);
      console.info(err);
      return res.redirect('/login');
    }));

module.exports = getApiData;
