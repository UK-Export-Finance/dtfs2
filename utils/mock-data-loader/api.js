const axios = require('axios');
require('dotenv').config();

// TODO multiple services talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json??

const urlRoot = process.env.DEAL_API_URL;

const createBank = async (bank) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/banks`,
    data: bank,
  });

  return response.data;
};

const createBondCurrency = async (bondCurrency) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/bond-currencies`,
    data: bondCurrency,
  });

  return response.data;
};

const createCountry = async (country) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/countries`,
    data: country,
  });

  return response.data;
};

const createDeal = async (deal) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/deals`,
    data: deal,
  });

  return response.data;
};

const createIndustrySector = async (industrySector) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/industry-sectors`,
    data: industrySector,
  });

  return response.data;
};

const createMandatoryCriteria = async (mandatoryCriteria) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/mandatory-criteria`,
    data: mandatoryCriteria,
  });

  return response.data;
};

const createTransaction = async (transaction) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/transactions`,
    data: transaction,
  });

  return response.data;
};

const deleteBank = async (deal) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/banks/${deal.id}`,
  });

  return response.data;
};

const deleteBondCurrency = async (bondCurrency) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/bond-currencies/${bondCurrency.id}`,
  });

  return response.data;
};

const deleteCountry = async (country) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/countries/${country.code}`,
  });

  return response.data;
};

const deleteDeal = async (deal) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/deals/${deal.id}`,
  });

  return response.data;
};

const deleteIndustrySector = async (industrySector) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/industry-sectors/${industrySector.code}`,
  });

  return response.data;
};

const deleteMandatoryCriteria = async (mandatoryCriteria) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/mandatory-criteria/${mandatoryCriteria.id}`,
  });

  return response.data;
};

const deleteTransaction = async (transaction) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/transactions/${transaction.bankFacilityId}`,
  });

  return response.data;
};

const listBanks = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/banks`,
  });

  return response.data.banks;
};

const listBondCurrencies = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/bond-currencies`,
  });

  return response.data.bondCurrencies;
};

const listCountries = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/countries`,
  });

  return response.data.countries;
};

const listDeals = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/deals`,
  });

  return response.data.deals;
};

const listIndustrySectors = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/industry-sectors`,
  });

  return response.data.industrySectors;
};

const listMandatoryCriteria = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/mandatory-criteria`,
  });

  return response.data.mandatoryCriteria;
};

const listTransactions = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/transactions`,
  });

  return response.data.transactions;
};

module.exports = {
  createBank,
  createBondCurrency,
  createCountry,
  createDeal,
  createIndustrySector,
  createMandatoryCriteria,
  createTransaction,
  deleteBank,
  deleteBondCurrency,
  deleteCountry,
  deleteDeal,
  deleteIndustrySector,
  deleteMandatoryCriteria,
  deleteTransaction,
  listBanks,
  listBondCurrencies,
  listCountries,
  listDeals,
  listIndustrySectors,
  listMandatoryCriteria,
  listTransactions,
};
