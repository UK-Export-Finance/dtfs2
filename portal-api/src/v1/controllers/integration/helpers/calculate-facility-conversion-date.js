const dateHelpers = require('./date-helpers');

const calculateFacilityConversionDate = (facility, dealCurrency) => {
  if (facility.currencySameAsSupplyContractCurrency === 'true' || facility.currency.id === dealCurrency) {
    return '';
  }
  console.log('CONVERSION',
    facility['conversionRateDate-day'], facility['conversionRateDate-month'], facility['conversionRateDate-year'],
    dateHelpers.formatDate(facility['conversionRateDate-day'], facility['conversionRateDate-month'], facility['conversionRateDate-year']));

  return dateHelpers.formatDate(facility['conversionRateDate-day'], facility['conversionRateDate-month'], facility['conversionRateDate-year']);
};

module.exports = calculateFacilityConversionDate;
