const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');

const convertFacilityCurrency = async (facility, dealSubmissionDate) => {
  const { currencyCode, value, coverPercentage, ukefExposure } = facility;

  let facilityUpdate;

  if (currencyCode && currencyCode !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(currencyCode, 'GBP');

    const { midPrice: exchangeRate } = currencyExchange;
    if (exchangeRate) {
      const facilityValueInGBP = value * exchangeRate;

      facilityUpdate = {
        exchangeRate,
        facilityValueInGBP,
        ...calculateUkefExposure(facilityValueInGBP, coverPercentage),
      };
    }
  } else {
    facilityUpdate = {
      ukefExposure: Number(String(ukefExposure).replace(/,/g, '')),
      ukefExposureCalculationTimestamp: dealSubmissionDate,
    };
  }

  return facilityUpdate;
};

module.exports = convertFacilityCurrency;
