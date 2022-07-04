const { hasValue } = require('../../../../utils/string');
const currency = require('./currency');
const conversionRate = require('./conversion-rate');
const conversionRateDate = require('./conversion-rate-date');

module.exports = (bond, errorList, deal) => {
  let newErrorList = { ...errorList };
  const {
    currencySameAsSupplyContractCurrency,
  } = bond;

  if (hasValue(currencySameAsSupplyContractCurrency)
    && currencySameAsSupplyContractCurrency === 'false') {
    newErrorList = currency(bond, newErrorList);
    newErrorList = conversionRate(bond, newErrorList);
    newErrorList = conversionRateDate(bond, newErrorList, deal);
  }

  return newErrorList;
};
