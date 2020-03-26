const axios = require('axios');
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
  console.log(`api.contract() => `, response.data)
  return response.data;
};

const contracts = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/v1/deals`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data.deals;
  } catch (err) {
    return new Error('error with token');// do something proper here, but for now just reject failed logins..
  }
};

const upsertDeal = async (deal, token) => {
  console.log(`upserting: \n${JSON.stringify(deal)}`)
  if (deal._id) {
    return updateDeal(deal, token);
  } else {
    return createDeal(deal, token);
  }
}

const createDeal = async (deal, token) => {
  console.log(`creating: \n${JSON.stringify(deal)}`)

  try {
    const response = await axios({
      method: 'post',
      url: `${urlRoot}/api/deals`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: deal
    });

    return response.data;
  } catch (err) {
    console.log(err.stack)
    throw err;
  }
}

const updateDeal = async (deal, token) => {
  console.log(`updating: \n${JSON.stringify(deal)}`)

  try {
    const response = await axios({
      method: 'put',
      url: `${urlRoot}/api/deals/${deal._id}`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: deal
    });

    return response.data;
  } catch (err) {
    console.log(err.stack)
    throw err;
  }
}


const banks = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/v1/banks`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    return response.data.banks;
  } catch (err) {
    return new Error('error with token');// do something proper here, but for now just reject failed logins..
  }
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
  return {
    contractId: response.id,
    bond: response.bondTransactions.items.find((bond) => bond.id === bondId),
  };
};

export default {
  banks,
  bondCurrencies,
  contract,
  contractBond,
  contracts,
  countries,
  industrySectors,
  login,
  mandatoryCriteria,
  transactions,
  upsertDeal,
};
