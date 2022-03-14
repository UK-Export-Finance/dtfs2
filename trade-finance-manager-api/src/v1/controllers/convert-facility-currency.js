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

    // TODO: DTFS2-4703 - rename to valueInGBP
    const facilityValueInGBP = value * exchangeRate;

    facilityUpdate = {
      exchangeRate,
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
