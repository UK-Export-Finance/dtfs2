const { findOneCurrency } = require('../controllers/currencies.controller');

const getCurrencyObject = async (currencyCode) => {
  const currencyObj = await findOneCurrency(currencyCode);
  const { text, id } = currencyObj;

  return {
    text,
    id,
  };
};

const handleTransactionCurrencyFields = async (dealSection, deal) => {
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
      modifiedSection.currency = await getCurrencyObject(supplyContractCurrencyCodeId);
    }
  } else if (currencyCode) {
    // TODO: make this clearer
    // currencyCode can be a single string (from form),
    // or an object with ID, if has been previously submitted.
    const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
    modifiedSection.currency = await getCurrencyObject(actualCurrencyCode);
  }

  return modifiedSection;
};


module.exports = {
  getCurrencyObject,
  handleTransactionCurrencyFields,
};
