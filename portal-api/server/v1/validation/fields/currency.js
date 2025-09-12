const { findOneCurrency } = require('../../controllers/currencies.controller');

module.exports.currencyIsDisabled = (id) => {
  const { data: currency } = findOneCurrency(id);
  return currency && currency.disabled;
};
