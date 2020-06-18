const { findOneCurrency } = require('../../currencies.controller');

const convertCurrencyCodeToId = async (code) => {
  const currency = await findOneCurrency(code);
  return currency ? currency.currencyId : code;
};

module.exports = convertCurrencyCodeToId;
