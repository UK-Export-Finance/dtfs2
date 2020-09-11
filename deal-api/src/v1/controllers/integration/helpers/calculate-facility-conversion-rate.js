const calculateFacilityConversionRate = (facility, dealCurrency) => {
  if (facility.currencySameAsSupplyContractCurrency === 'true' || facility.currency.id === dealCurrency) {
    return 1;
  }

  return facility.conversionRate;
};

module.exports = calculateFacilityConversionRate;
