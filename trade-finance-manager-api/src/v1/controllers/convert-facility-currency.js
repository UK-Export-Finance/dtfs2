const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');

const convertFacilityCurrency = async (facility, dealSubmissionDate) => {
  const {
    currencyCode,
    value,
    coverPercentage,
    ukefExposure,
  } = facility;

  let facilityUpdate;

  if (currencyCode && currencyCode !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(currencyCode, 'GBP');

    const {
      midPrice: exchangeRate,
    } = currencyExchange;

    const valueInGBP = value * exchangeRate;

    facilityUpdate = {
      exchangeRate,
      valueInGBP,
      ...calculateUkefExposure(valueInGBP, coverPercentage),
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
