const axios = require('axios');
const FormData = require('form-data');
const { translateDatesToExpectedFormat, translateAllDatesToExpectedFormat } = require('./dateFormatter');
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

const serialiseFilters = (filters) => JSON.stringify(filters);

const contracts = async (start, pagesize, filters, token) => {
  const serialisedFilters = serialiseFilters(filters);

  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${start}/${pagesize}/${serialisedFilters}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const fixed = {
    ...response.data,
    deals: await translateAllDatesToExpectedFormat(response.data.deals),
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
      formData.append(`${fieldname}[]`, value);
    }
  });

  // formData.append('test', 'test1');
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

  return response.data.transactions;
};

const contractBond = async (id, bondId, token) => {
  const response = await contract(id, token);
  const { _id } = response;
  return {
    contractId: _id,
    bond: response.bondTransactions.items.find((bond) => bond.id === bondId),
  };
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

const fileshareURL = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/fileshare/url`,
  });

  return response.data;
};


export default {
  banks,
  bondCurrencies,
  cloneDeal,
  contract,
  contractBond,
  contracts,
  countries,
  createDeal,
  industrySectors,
  login,
  mandatoryCriteria,
  transactions,
  updateDeal,
  updateDealName,
  updateDealStatus,
  updateEligibilityCriteria,
  updateEligibilityDocumentation,
  validateToken,
  fileshareURL,
};
