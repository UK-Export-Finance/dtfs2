const makeApiCall = async (query) => {
  try {
    const result = await query;
    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

// could have similar 'postApiData' and handle form error responses/mappings on catch
export const getApiData = (query, res) => new Promise((resolve) =>
  makeApiCall(query).then((data) => resolve(data))
    .catch(() => { // eslint-disable-line
      // currently assuming all api GET errors are auth errors,
      // redirect to login
      // unauth handling could be middleware
      return res.redirect('/');
    }));

export const requestParams = (req) => {
  const { _id, bondId } = req.params;
  const { userToken } = req.session;

  return { _id, bondId, userToken };
};

export const generateErrorSummary = (validationErrors, hrefGenerator = (id) => id) => {
  if (!validationErrors) { return false; }

  const summary = Object.keys(validationErrors.errorList).map((id) => ({
    text: validationErrors.errorList[id],
    href: hrefGenerator(id),
  }));
  
  return {
    ...validationErrors,
    summary,
  };
};
