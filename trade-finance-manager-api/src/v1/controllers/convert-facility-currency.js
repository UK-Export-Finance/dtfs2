const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');

const convertFacilityCurrency = async (facility, dealSubmissionDate) => {
  const {
    currency,
    facilityValue,
    coveredPercentage,
    ukefExposure,
  } = facility;

  let facilityUpdate;

  if (currency && currency.id !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(currency.id, 'GBP');

    const {
      midPrice: exchangeRate,
    } = currencyExchange;

    const strippedFacilityValue = Number(facilityValue.replace(/,/g, ''));

    const facilityValueInGBP = strippedFacilityValue * exchangeRate;

    facilityUpdate = {
      facilityValueInGBP,
      ...calculateUkefExposure(facilityValueInGBP, coveredPercentage),
    };
  } else {
    facilityUpdate = {
      ukefExposure: Number(String(ukefExposure).replace(/,/g, '')),
      ukefExposureCalculationTimestamp: dealSubmissionDate,
    };
  }

  return facilityUpdate;
};

module.exports = convertFacilityCurrency;
