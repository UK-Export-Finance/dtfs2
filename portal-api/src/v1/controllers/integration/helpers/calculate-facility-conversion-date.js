const dateHelpers = require('./date-helpers');

const calculateFacilityConversionDate = (facility, dealCurrency) => {
  if (facility.currencySameAsSupplyContractCurrency === 'true' || facility.currency.id === dealCurrency) {
    return '';
  }

  return dateHelpers.formatDate(facility['conversionRateDate-day'], facility['conversionRateDate-month'], facility['conversionRateDate-year']);
};

module.exports = calculateFacilityConversionDate;
