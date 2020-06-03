const { hasValue } = require('../../../../utils/string');
const currency = require('./currency');
const conversionRate = require('./conversion-rate');
const conversionRateDate = require('./conversion-rate-date');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };
  const {
    transactionCurrencySameAsSupplyContractCurrency,
  } = bond;

  if (hasValue(transactionCurrencySameAsSupplyContractCurrency)
    && transactionCurrencySameAsSupplyContractCurrency === 'false') {
    newErrorList = currency(bond, newErrorList);
    newErrorList = conversionRate(bond, newErrorList);
    newErrorList = conversionRateDate(bond, newErrorList);
  }

  return newErrorList;
};
