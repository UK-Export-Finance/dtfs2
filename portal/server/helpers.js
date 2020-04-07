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

export const getFlashSuccessMessage = (req) => req.flash('successMessage')[0];


export const errorHref = (id) => `#${id}`;

export const generateErrorSummary = (validationErrors, hrefGenerator = (id) => id) => {
  if (!validationErrors) { return false; }

  // Example validationErrors format
  /*
    {
      "count": 4,
      "errorList": {
          "12": {
              "text": "Eligibility criterion 12 is required",
              "order": "12"
          },
          "13": {
              "text": "Eligibility criterion 13 is required",
              "order": "13"
          },
          "agent-address-line-1": {
              "text": "Agent's corporate address is required",
              "order": "11-3"
          },
          "agent-country": {},
          "agent-name": {},
          "agent-postcode": {
              "text": "Agent's corporate postcode is required",
              "order": "11-4"
          }
      }
    }
  */

  /*
    Need to remove validation errors without a text value
    (as db does a partial update and doesn't remove previous validation errors.
    fixed validation errors are set to {} instead
    and then order the validation errors so their displayed in correct order
  */
  const filteredValidationErrorListArray = Object.entries(validationErrors.errorList)
    .filter(([, value]) => value.text)
    .sort(([, aValue], [, bValue]) => {
      if (aValue.order < bValue.order) return -1;
      if (aValue.order > bValue.order) return 1;
      return 0;
    });
    // note: [,value] used to prevent 'no unused vars' eslint warning
    // see https://github.com/babel/babel-eslint/issues/274

  const filteredValidationErrorList = Object.fromEntries(filteredValidationErrorListArray);

  const summary = filteredValidationErrorListArray.map(([id, value]) => ({
    text: value.text,
    href: hrefGenerator(id),
  }));

  return {
    count: filteredValidationErrorListArray.length,
    errorList: filteredValidationErrorList,
    summary,
  };
};

export const formatCountriesForGDSComponent = ((countries, selectedCountryCode) => {
  const countryOptions = countries.map((c) => ({
    value: c.code,
    text: c.name,
    selected: c.code === selectedCountryCode,
  }));
  return countryOptions;
});
