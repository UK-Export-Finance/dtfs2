const api = require('../../api');

let currencies;

const initCurrencies = async (token) => {
  currencies = await api.listCurrencies(token);
  return currencies;
};

const getCurrencyById = (currencyId = '') => {
  const v2Currency = currencies.find((c) => c.currencyId.toString() === currencyId.toString());
  if (!v2Currency) return {};

  return {
    id: v2Currency.id,
    text: v2Currency.text,
  };
};

const formatCurrency = (value) => Number(value).toFixed(2);

module.exports = {
  initCurrencies,
  getCurrencyById,
  formatCurrency,
};
