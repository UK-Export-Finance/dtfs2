const currencyController = require('../../currencies.controller');

const convertCurrencyCodeToId = async (code) => {
  const currency = await currencyController.findOneCurrency(code);
  return currency ? currency.currencyId : code;
};

module.exports = convertCurrencyCodeToId;
