const makeApiCall = async (query) => {
  try {
    const result = await query;
    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

export const getApiData = (query, res) => new Promise((resolve) =>
  makeApiCall(query).then((data) => resolve(data))
    .catch(() => { // eslint-disable-line
      // can handle form error responses/mappings here
      //
      // currently assuming all errors are auth errors,
      // redirect to login
      // unauth handling could be middleware
      return res.redirect('/');
    }));

export const getDealIdAndToken = (req) => {
  const { _id, bondId } = req.params;
  const { userToken } = req.session;

  return { _id, bondId, userToken };
};
