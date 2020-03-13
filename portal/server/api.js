const axios = require("axios");
require("dotenv").config();
const urlRoot = process.env.DEAL_API_URL;

const contract = async id => {
  const response = await axios(`${urlRoot}/api/deals/${id}`);
  return response.data;
};

const contracts = async () => {
  const response = await axios(`${urlRoot}/api/deals`);
  return response.data;
};


const banks = async () => {
  const response = await axios(`${urlRoot}/mocks/banks`);
  return response.data;
};

const bondCurrencies = async () => {
  const response = await axios(`${urlRoot}/mocks/bondCurrencies`);
  return response.data;
};

const contractBond = async (id, bondId) => {
  const response = await contract(id);
  return {
    contractId: response.id,
    bond: response.bondTransactions.items.find(bond => bond.id === bondId)
  }
};

const mandatoryCriteria = async () => {
  const response = await axios(`${urlRoot}/mocks/mandatoryCriteria`);
  return response.data;
};

const transactions = async () => {
  const response = await axios(`${urlRoot}/mocks/transactions`);
  return response.data;
};

export default {
  banks,
  bondCurrencies,
  contract,
  contractBond,
  contracts,
  mandatoryCriteria,
  transactions
};
