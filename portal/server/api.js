const axios = require('axios');
const FormData = require('form-data');
const apollo = require('./graphql/apollo');

const { translateDatesToExpectedFormat, translateAllDatesToExpectedFormat } = require('./dateFormatter');

const { dealsQuery } = require('./graphql/queries');

require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;


const login = async (username, password) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${urlRoot}/v1/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { username, password },
    });

    return response.data ? {
      success: response.data.success,
      token: response.data.token,
      user: response.data.user,
    } : '';
  } catch (err) {
    return new Error('error with token');// do something proper here, but for now just reject failed logins..
  }
};

// TODO middleware uses getDeal; once everything uses middleware get rid of the 'contract' method..
const getDeal = async (id, token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${id}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const deal = await translateDatesToExpectedFormat(response.data);

  return {
    status: response.status,
    deal,
  };
};

const contract = async (id, token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${id}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return translateDatesToExpectedFormat(response.data);
};


const contracts = async (start, pagesize, filters, token) => {
  const params = {
    start,
    pagesize,
    filters,
  };

  const response = await apollo('GET', dealsQuery, params, token);

  const fixed = {
    ...response.data.deals,
    deals: await translateAllDatesToExpectedFormat(response.data.deals.deals),
  };

  return fixed;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    url: `${urlRoot}/v1/deals`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: deal,
  });

  return translateDatesToExpectedFormat(response.data);
};

const updateDeal = async (deal, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${deal._id}`, // eslint-disable-line no-underscore-dangle
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: deal,
  });

  return {
    status: response.status,
    data: await translateDatesToExpectedFormat(response.data),
  };
};

const updateDealName = async (id, newName, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${id}/bankSupplyContractName`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: { bankSupplyContractName: newName },
  });

  return {
    status: response.status,
    data: response.data,
  };
};

const updateDealStatus = async (statusUpdate, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${statusUpdate._id}/status`, // eslint-disable-line no-underscore-dangle
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: statusUpdate,
  });

  return {
    status: response.status,
    data: response.data,
  };
};

const getSubmissionDetails = async (id, token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${id}/submission-details`, // eslint-disable-line no-underscore-dangle
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
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
    url: `${urlRoot}/v1/deals/${deal._id}/submission-details`, // eslint-disable-line no-underscore-dangle
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
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
  const response = await axios({
    method: 'post',
    url: `${urlRoot}/v1/deals/${dealId}/clone`, // eslint-disable-line no-underscore-dangle
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: newDealData,
  });

  return response.data;
};

const updateEligibilityCriteria = async (dealId, criteria, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/eligibility-criteria`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: criteria,
  });
  return response.data;
};

const updateEligibilityDocumentation = async (dealId, body, files, token) => {
  const formData = new FormData();

  Object.entries(body).forEach(([fieldname, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(fieldname, v));
    } else {
      formData.append(`${fieldname}`, value);
    }
  });

  files.forEach((file) => {
    formData.append(file.fieldname, file.buffer, file.originalname);
  });


  const formHeaders = formData.getHeaders();

  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/eligibility-documentation`,
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

const createBond = async (dealId, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/bond/create`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const updateBond = async (dealId, bondId, formData, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const createLoan = async (dealId, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/loan/create`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const updateLoan = async (dealId, loanId, formData, token) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const banks = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/banks`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.banks;
};

// TODO once world uses middleware, remove the old 'bondCurrencies' method
const getCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/bond-currencies`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    currencies: response.data.bondCurrencies,
  };
};

const bondCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/bond-currencies`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.bondCurrencies;
};

// TODO once world uses middleware, remove the old 'countries method'
const getCountries = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/countries`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    countries: response.data.countries,
  };
};

const countries = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/countries`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.countries;
};

// TODO once world uses middleware, remove the old 'industrySectors method'
const getIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/industry-sectors`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    industrySectors: response.data.industrySectors,
  };
};

const industrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/industry-sectors`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.industrySectors;
};

const mandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/mandatory-criteria`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.mandatoryCriteria;
};

const transactions = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/transactions`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    count: response.data.count,
    transactions: response.data.transactions,
  };
};

const contractBond = async (dealId, bondId, token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const validateToken = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/validate`,
  });

  return response.status === 200;
};

const users = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  });

  return response.data;
};

const user = async (id, token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/users/${id}`,
  });

  return response.data;
};


export default {
  banks,
  bondCurrencies,
  cloneDeal,
  createLoan,
  contract,
  contractBond,
  contracts,
  countries,
  createBond,
  createDeal,
  industrySectors,
  login,
  mandatoryCriteria,
  transactions,
  updateBond,
  updateDeal,
  updateDealName,
  updateDealStatus,
  updateEligibilityCriteria,
  updateEligibilityDocumentation,
  updateLoan,
  getSubmissionDetails,
  updateSubmissionDetails,
  validateToken,
  users,
  user,
  getDeal,
  getCurrencies,
  getCountries,
  getIndustrySectors,
};
