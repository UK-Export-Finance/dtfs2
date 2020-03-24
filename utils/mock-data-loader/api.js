const axios = require('axios');
require('dotenv').config();

// TODO multiple services talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json??

const urlRoot = process.env.DEAL_API_URL;

const createBank = async (bank, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/banks`,
    data: bank,
  });

  return response.data;
};

const createBondCurrency = async (bondCurrency, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/bond-currencies`,
    data: bondCurrency,
  });

  return response.data;
};

const createCountry = async (country, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/countries`,
    data: country,
  });

  return response.data;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/deals`,
    data: deal,
  });

  return response.data;
};

const createIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/industry-sectors`,
    data: industrySector,
  });

  return response.data;
};

const createMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/mandatory-criteria`,
    data: mandatoryCriteria,
  });

  return response.data;
};

const createTransaction = async (transaction, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/transactions`,
    data: transaction,
  });

  return response.data;
};

const createUser = async (user) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/users`,
    data: user,
  });

  return response.data;
};

const deleteBank = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/banks/${deal.id}`,
  });

  return response.data;
};

const deleteBondCurrency = async (bondCurrency, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/bond-currencies/${bondCurrency.id}`,
  });

  return response.data;
};

const deleteCountry = async (country, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/countries/${country.code}`,
  });

  return response.data;
};

const deleteDeal = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/deals/${deal.id}`,
  });

  return response.data;
};

const deleteIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/industry-sectors/${industrySector.code}`,
  });

  return response.data;
};

const deleteMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/mandatory-criteria/${mandatoryCriteria.id}`,
  });

  return response.data;
};

const deleteTransaction = async (transaction, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/transactions/${transaction.bankFacilityId}`,
  });

  return response.data;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/users/${user.username}`,
  });

  return response.data;
};

const listBanks = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/banks`,
  });

  return response.data.banks;
};

const listBondCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/bond-currencies`,
  }).catch( (err) => {
    console.log(err);
  });

  return response.data.bondCurrencies;
};

const listCountries = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/countries`,
  });

  return response.data.countries;
};

const listDeals = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/deals`,
  });

  return response.data.deals;
};

const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/industry-sectors`,
  });

  return response.data.industrySectors;
};

const listMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token?token:'',
    },
    url: `${urlRoot}/api/mandatory-criteria`,
  });

  return response.data.mandatoryCriteria;
};

const listTransactions = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token?token:'',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/transactions`,
  });

  return response.data.transactions;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/users`,
  });

  return response.data.users;
};

module.exports = {
  createBank,
  createBondCurrency,
  createCountry,
  createDeal,
  createIndustrySector,
  createMandatoryCriteria,
  createTransaction,
  createUser,
  deleteBank,
  deleteBondCurrency,
  deleteCountry,
  deleteDeal,
  deleteIndustrySector,
  deleteMandatoryCriteria,
  deleteTransaction,
  deleteUser,
  listBanks,
  listBondCurrencies,
  listCountries,
  listDeals,
  listIndustrySectors,
  listMandatoryCriteria,
  listTransactions,
  listUsers,
};
