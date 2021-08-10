const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');

const convertFacilityCurrency = async (facility, dealSubmissionDate) => {
  const {
    currency,
    value,
    coverPercentage,
    ukefExposure,
  } = facility;

  let facilityUpdate;

  if (currency && currency.id !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(currency.id, 'GBP');

    const {
      midPrice: exchangeRate,
    } = currencyExchange;

    // TODO: rename to valueInGBP
    const facilityValueInGBP = value * exchangeRate;

    facilityUpdate = {
      facilityValueInGBP,
      ...calculateUkefExposure(facilityValueInGBP, coverPercentage),
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
