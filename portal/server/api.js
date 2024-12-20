const { HttpStatusCode } = require('axios');
const axios = require('axios');
const FormData = require('form-data');
const { HEADERS } = require('@ukef/dtfs2-common');
const { isValidMongoId, isValidResetPasswordToken, isValidDocumentType, isValidFileName, isValidBankId } = require('./validation/validate-ids');
const { FILE_UPLOAD } = require('./constants');

require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;

const headers = {
  'x-api-key': PORTAL_API_KEY,
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

const login = async (username, password) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/login`,
    headers,
    data: { username, password },
  });

  const { token, loginStatus, user } = response.data;
  return { token, loginStatus, user };
};

/**
 * Sends a new sign in link to a user
 * @param {string} token auth token
 * @returns {Promise<Object>} Response object
 */
const sendSignInLink = async (token) =>
  axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users/me/sign-in-link`,
    headers: {
      Authorization: token,
    },
  });

/**
 * Logs in a user using a sign in link
 * @param {Object} parameters token, userId and signInToken
 * @returns {Promise<Object>} loginStatus, token and user
 */
const loginWithSignInLink = async ({ token: requestAuthToken, userId, signInToken }) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users/${userId}/sign-in-link/${signInToken}/login`,
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Authorization: requestAuthToken,
    },
  });

  const { token, loginStatus, user } = response.data;
  return {
    loginStatus,
    token,
    user,
  };
};

const resetPassword = async (email) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users/reset-password`,
    headers,
    data: { email },
  });

  return { success: response.status === 200 };
};

const resetPasswordFromToken = async (resetPwdToken, formData) => {
  if (!isValidResetPasswordToken(resetPwdToken)) {
    console.error('Reset password from token API call failed for token %s', resetPwdToken);
    return false;
  }

  try {
    const response = await axios({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/users/reset-password/${resetPwdToken}`,
      headers,
      data: formData,
    });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Reset password failed %o', error?.response?.data);
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data,
    };
  }
};

const allDeals = async (start, pagesize, filters, token, sort) => {
  const payload = {
    start,
    pagesize,
    filters,
    sort,
  };

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: payload,
  });

  return response.data;
};

const allFacilities = async (start, pagesize, filters, token, sort) => {
  const payload = {
    start,
    pagesize,
    filters,
    sort,
  };

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/facilities`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: payload,
  });

  return response.data;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/deals`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: deal,
  });

  return response.data;
};

const updateDealName = async (id, newName, token) => {
  if (!isValidMongoId(id)) {
    console.error('Update deal name API call failed for id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${id}/additionalRefName`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: { additionalRefName: newName },
  });

  return {
    status: response.status,
    data: response.data,
  };
};

/**
 * Updates the status of a deal by making an API call to a specified URL.
 * @param {Object} statusUpdate - An object containing the `_id` property representing
 * the deal ID and the `status` property representing the new status of the deal.
 * @param {string} token - A token used for authorization in the API call.
 * @returns {Promise<Object | boolean>} - An object containing the `status` code and the `data` from the API response, or `false` if the `_id` is not valid.
 */
const updateDealStatus = async (statusUpdate, token) => {
  if (!isValidMongoId(statusUpdate._id)) {
    console.error('Update deal status API call failed for id %s', statusUpdate._id);
    return false;
  }

  try {
    const response = await axios.put(`${PORTAL_API_URL}/v1/deals/${statusUpdate._id}/status`, statusUpdate, {
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Unable to update the deal status of deal %o', error);
    return {
      status: HttpStatusCode.InternalServerError,
      data: null,
    };
  }
};

const getSubmissionDetails = async (id, token) => {
  if (!isValidMongoId(id)) {
    console.error('Get submission details API call failed for id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${id}/submission-details`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return {
    status: response.status,
    validationErrors: response.data.validationErrors,
    data: response.data.data,
  };
};

const updateSubmissionDetails = async (deal, submissionDetails, token) => {
  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${deal._id}/submission-details`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: submissionDetails,
  });

  return {
    status: response.status,
    validationErrors: response.data.validationErrors,
    data: response.data.data,
  };
};

const cloneDeal = async (dealId, newDealData, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Clone deal API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/clone`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: newDealData,
  });

  return response.data;
};

const updateEligibilityCriteria = async (dealId, criteria, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Update eligibility criteria API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/eligibility-criteria`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: criteria,
  });
  return response.data;
};

const updateEligibilityDocumentation = async (dealId, body, files, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Update eligibility documentation API call failed for id %s', dealId);
    return false;
  }

  const formData = new FormData();

  Object.entries(body).forEach(([fieldname, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(fieldname, v));
    } else {
      formData.append(`${fieldname}`, value);
    }
  });

  files.forEach((file) => {
    formData.append(file.fieldname, file.buffer, file.originalname, file.size);
  });

  const formHeaders = formData.getHeaders();

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/eligibility-documentation`,
    headers: {
      Authorization: token,
      ...formHeaders,
    },
    data: formData.getBuffer(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

const createLoan = async (dealId, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Create loan API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/create`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const getLoan = async (dealId, loanId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Get loan API call failed for id %s %s', dealId, loanId);
    return false;
  }
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const updateLoan = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Update loan API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const updateLoanIssueFacility = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Update loan issue facility API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}/issue-facility`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const updateLoanCoverStartDate = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Get loan cover start date API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}/change-cover-start-date`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const deleteLoan = async (dealId, loanId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Delete loan API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'delete',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const createBond = async (dealId, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Create bond API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/create`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const contractBond = async (dealId, bondId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Get contract bond API call failed for id %s %s', dealId, bondId);
    return false;
  }
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const updateBond = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const updateBondIssueFacility = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond issue facility API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}/issue-facility`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const updateBondCoverStartDate = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond cover start date API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}/change-cover-start-date`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: formData,
  });
  return response.data;
};

const deleteBond = async (dealId, bondId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Delete bond API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'delete',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const banks = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/banks`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return response.data.banks;
};

const getCurrencies = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/currencies`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  const filteredCurrencies = response.data.currencies.filter((currency) => includeDisabled || !currency.disabled);

  return {
    status: response.status,
    currencies: filteredCurrencies,
  };
};

const getCountries = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/countries`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  const filteredCountries = response.data.countries.filter((country) => includeDisabled || !country.disabled);

  return {
    status: response.status,
    countries: filteredCountries,
  };
};

const getIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/industry-sectors`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return {
    status: response.status,
    industrySectors: response.data.industrySectors,
  };
};

const validateToken = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    url: `${PORTAL_API_URL}/v1/validate`,
  }).catch((error) => error.response);
  return response.status === 200;
};

const validatePartialAuthToken = (token) =>
  axios({
    method: 'get',
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    url: `${PORTAL_API_URL}/v1/validate-partial-2fa-token`,
  });

const validateBank = async (dealId, bankId, token) => {
  try {
    const { data } = await axios({
      method: 'get',
      url: `${PORTAL_API_URL}/v1/validate/bank`,
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
      data: { dealId, bankId },
    });
    return data;
  } catch (error) {
    console.error('Unable to validate the bank %o', error);
    return 'Failed to validate the bank';
  }
};

const users = async (token) => {
  if (!token) {
    console.error('Get Users API call failed due to missing token');
    return false;
  }

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    url: `${PORTAL_API_URL}/v1/users`,
  });

  return response.data;
};

const user = async (id, token) => {
  if (!token) {
    console.error('Get User API call failed due to missing token');
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('User API call failed for id %s', id);
    return false;
  }

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    url: `${PORTAL_API_URL}/v1/users/${id}`,
  });

  return response.data;
};

const createUser = async (userToCreate, token) => {
  if (!token) {
    console.error('Create User API call failed due to missing token');
    return false;
  }

  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: userToCreate,
  }).catch((error) => {
    console.error('Unable to create user:', error);
    return error.response;
  });

  return response;
};

const updateUser = async (id, update, token) => {
  if (!token) {
    console.error('Update User API call failed due to missing token');
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('Update user API call failed for id %s', id);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/users/${id}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: update,
  }).catch((error) => {
    console.error('Unable to update user %o', error);
    return error.response;
  });

  return response;
};

const getDeal = async (id, token) => {
  if (!isValidMongoId(id)) {
    console.error('Get deal API call failed for deal id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${id}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return {
    status: response.status,
    deal: response.data.deal,
    validationErrors: response.data.validationErrors,
  };
};

const getLatestMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/mandatory-criteria/latest`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return response.data;
};

const downloadEligibilityDocumentationFile = async (id, fieldname, filename, token) => {
  if (!isValidMongoId(id)) {
    console.error('Download file API call failed for id %s', id);
    return false;
  }

  if (!isValidDocumentType(fieldname)) {
    console.error('Download file API call failed for fieldname %s', fieldname);
    return false;
  }

  if (!isValidFileName(filename)) {
    console.error('Download file API call failed for filename %s', filename);
    return false;
  }

  const response = await axios({
    method: 'get',
    responseType: 'stream',
    url: `${PORTAL_API_URL}/v1/deals/${id}/eligibility-documentation/${fieldname}/${filename}`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return response.data;
};

const createFeedback = async (formData, token) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/feedback`,
    headers: {
      Authorization: token,
      ...headers,
    },
    data: formData,
  });
  return response.data;
};

const getUnissuedFacilitiesReport = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${PORTAL_API_URL}/v1/reports/unissued-facilities`,
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Unable to return unissued facilities %o', error);
    return { status: error?.code || 500, data: 'Error getting unissued facilities report.' };
  }
};

const getUkefDecisionReport = async (token, payload) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${PORTAL_API_URL}/v1/reports/review-ukef-decision`,
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to return UKEF decision report %o', error);
    return { status: error?.code || 500, data: 'Error getting Ukef decision report.' };
  }
};

/**
 * Uploads the utilisation report data
 * @param {import('@ukef/dtfs2-common').PortalSessionUser} uploadingUser - The user uploading the report
 * @param {import('@ukef/dtfs2-common').ReportPeriod} reportPeriod - The report period
 * @param {Record<string, string | null>[]} csvData
 * @param {Buffer} csvFileBuffer
 * @param {string} formattedReportPeriod - The formatted report period
 * @param {string} token - The user token
 * @returns {Promise<import('axios').AxiosResponse>} The response from the API
 */
const uploadUtilisationReportData = async (uploadingUser, reportPeriod, csvData, csvFileBuffer, formattedReportPeriod, token) => {
  try {
    const formData = new FormData();
    formData.append('reportData', JSON.stringify(csvData));

    formData.append('user', JSON.stringify(uploadingUser));
    formData.append('reportPeriod', JSON.stringify(reportPeriod));
    formData.append('formattedReportPeriod', formattedReportPeriod);

    const buffer = Buffer.from(csvFileBuffer);
    const month = reportPeriod.start.month === reportPeriod.end.month ? `${reportPeriod.start.month}` : `${reportPeriod.start.month}_${reportPeriod.end.month}`;
    const filename = `${reportPeriod.start.year}_${month}_${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}_${uploadingUser.bank.name}_utilisation_report.csv`;
    formData.append('csvFile', buffer, { filename });

    const formHeaders = formData.getHeaders();

    const response = await axios({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/utilisation-reports`,
      headers: {
        Authorization: token,
        ...formHeaders,
      },
      data: formData.getBuffer(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response;
  } catch (error) {
    console.error('Unable to upload utilisation report %o', error);
    return { status: error?.code || 500, data: 'Error uploading utilisation report.' };
  }
};

/**
 * Generates validation errors for all errors in the utilisation report data
 * @param {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[]} reportData - The csv data with location information
 * @param {string} userToken - The user token
 * @returns {Promise<{csvValidationErrors: import('@ukef/dtfs2-common').UtilisationReportDataValidationError[]}>} - The validation errors for the utilisation report data
 */
const generateValidationErrorsForUtilisationReportData = async (reportData, bankId, userToken) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/banks/${bankId}/utilisation-reports/report-data-validation`,
    headers: {
      Authorization: userToken,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: {
      reportData,
    },
  });
  return response.data;
};

/**
 * Gets all previous reports for the supplied bank
 * @param {string} token - The user token
 * @param {string} bankId - The bank id
 * @returns {Promise<import('./api-response-types').PreviousUtilisationReportsResponseBody>} The previous reports grouped by year
 */
const getPreviousUtilisationReportsByBank = async (token, bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Getting previous utilisation reports failed for id ${bankId}`);
  }

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/banks/${bankId}/utilisation-reports`,
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });

  return response.data;
};

/**
 * Gets the last uploaded report for the bank with the specified id
 * @param {string} userToken - The user token
 * @param {string} bankId - The bank id
 * @returns {Promise<import('./api-response-types').UtilisationReportResponseBody>} The last uploaded report
 */
const getLastUploadedReportByBankId = async (userToken, bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Error getting last uploaded utilisation report: bank id '${bankId}' is invalid`);
  }

  const response = await axios.get(`${PORTAL_API_URL}/v1/banks/${bankId}/utilisation-reports/last-uploaded`, {
    headers: {
      Authorization: userToken,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const getDueReportPeriodsByBankId = async (token, bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Getting due utilisation reports failed for id ${bankId}`);
  }

  const response = await axios.get(`${PORTAL_API_URL}/v1/banks/${bankId}/due-report-periods`, {
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

/**
 * Gets the next report period for the bank with the specified id
 * @param {string} token - The user token
 * @param {strong} bankId - The bank id
 * @returns {Promise<import('@ukef/dtfs2-common').ReportPeriod} The next report period
 */
const getNextReportPeriodByBankId = async (token, bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Getting next report period failed for id ${bankId}`);
  }

  const response = await axios.get(`${PORTAL_API_URL}/v1/banks/${bankId}/next-report-period`, {
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

/**
 * Gets all pending corrections for earliest report with corrections for the supplied bank
 * @param {string} token - The user token
 * @param {string} bankId - The bank id
 * @returns {Promise<import('./api-response-types').UtilisationReportPendingCorrectionsResponseBody>} The pending corrections
 */
const getUtilisationReportPendingCorrectionsByBankId = async (token, bankId) => {
  if (!isValidBankId(bankId)) {
    throw new Error(`Getting next report period failed for id ${bankId}`);
  }

  const response = await axios.get(`${PORTAL_API_URL}/v1/banks/${bankId}/utilisation-reports/pending-corrections`, {
    headers: {
      Authorization: token,
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
  });
  return response.data;
};

const downloadUtilisationReport = async (userToken, bankId, id) =>
  await axios.get(`${PORTAL_API_URL}/v1/banks/${bankId}/utilisation-report-download/${id}`, {
    responseType: 'stream',
    headers: { Authorization: userToken },
  });

const getUkBankHolidays = async (token) => {
  try {
    const { data } = await axios.get(`${PORTAL_API_URL}/v1/bank-holidays`, {
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    });
    return data;
  } catch (error) {
    console.error('Unable to get UK bank holidays:', error);
    return { status: error?.response?.status || 500, data: 'Error getting UK bank holidays.' };
  }
};

module.exports = {
  allDeals,
  allFacilities,
  banks,
  cloneDeal,
  contractBond,
  createBond,
  createDeal,
  createLoan,
  createFeedback,
  login,
  resetPassword,
  resetPasswordFromToken,
  updateBond,
  updateBondIssueFacility,
  updateBondCoverStartDate,
  deleteBond,
  updateLoan,
  updateLoanIssueFacility,
  updateLoanCoverStartDate,
  deleteLoan,
  updateDealName,
  updateDealStatus,
  updateEligibilityCriteria,
  updateEligibilityDocumentation,
  getSubmissionDetails,
  updateSubmissionDetails,
  validateToken,
  validatePartialAuthToken,
  validateBank,
  users,
  user,
  createUser,
  sendSignInLink,
  loginWithSignInLink,
  updateUser,
  getCurrencies,
  getCountries,
  getDeal,
  getLoan,
  getIndustrySectors,
  getLatestMandatoryCriteria,
  downloadEligibilityDocumentationFile,
  getUnissuedFacilitiesReport,
  getUkefDecisionReport,
  generateValidationErrorsForUtilisationReportData,
  uploadUtilisationReportData,
  downloadUtilisationReport,
  getPreviousUtilisationReportsByBank,
  getLastUploadedReportByBankId,
  getDueReportPeriodsByBankId,
  getNextReportPeriodByBankId,
  getUkBankHolidays,
  getUtilisationReportPendingCorrectionsByBankId,
};
