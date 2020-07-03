const { findOneCurrency } = require('../controllers/currencies.controller');

const currencyObject = async (currencyCode) => {
  const currencyObj = await findOneCurrency(currencyCode);
  const { text, id } = currencyObj;

  return {
    text,
    id,
  };
};

module.exports = async (dealSection, deal) => {
  const modifiedSection = dealSection;
  let supplyContractCurrencyCodeId;

  if (deal.submissionDetails.supplyContractCurrency) {
    supplyContractCurrencyCodeId = deal.submissionDetails.supplyContractCurrency.id;
  }

  const {
    currencySameAsSupplyContractCurrency,
    currency: currencyCode,
  } = modifiedSection;

  if (currencySameAsSupplyContractCurrency && currencySameAsSupplyContractCurrency === 'true') {
    // remove any 'currency is NOT the same' specific values
    delete modifiedSection.currency;
    delete modifiedSection.conversionRate;
    delete modifiedSection['conversionRateDate-day'];
    delete modifiedSection['conversionRateDate-month'];
    delete modifiedSection['conversionRateDate-year'];

    if (supplyContractCurrencyCodeId) {
      modifiedSection.currency = await currencyObject(supplyContractCurrencyCodeId);
    }
  } else if (currencyCode) {
    // TODO: make this clearer
    // currencyCode can be a single string (from form),
    // or an object with ID, if has been previously submitted.
    const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
    modifiedSection.currency = await currencyObject(actualCurrencyCode);
  }

  return modifiedSection;
};
