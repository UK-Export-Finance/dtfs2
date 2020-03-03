const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

const banks = async () => {
  const response = await axios( `${urlRoot}/mocks/banks` );
  return response.data;
};

const contract = async (id) => {
  const response = await axios( `${urlRoot}/mocks/contract/${id}` );
  return response.data;
};

const contracts = async () => {
  const response = await axios( `${urlRoot}/mocks/contracts` );
  return response.data;
};

const mandatoryCriteria = async () => {
  const response = await axios( `${urlRoot}/mocks/mandatoryCriteria` );
  return response.data;
};

const transactions = async () => {
  const response = await axios( `${urlRoot}/mocks/transactions` );
  return response.data;
};

module.exports = {
  banks,
  contract,
  contracts,
  mandatoryCriteria,
  transactions
}
