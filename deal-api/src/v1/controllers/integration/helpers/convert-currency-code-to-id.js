const { findOneBondCurrency } = require('../../bondCurrencies.controller');

const convertCurrencyCodeToId = async (code) => {
  const currency = await findOneBondCurrency(code);
  return currency ? currency.currencyId : code;
};

module.exports = convertCurrencyCodeToId;
