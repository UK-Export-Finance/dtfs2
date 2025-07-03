const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');
const dateHelpers = require('../../utils/date');

const convertFacilityCurrency = async (facility, dealSubmissionDate) => {
  const {
    currencyCode,
    value,
    coverPercentage,
    ukefExposure,
  } = facility;

  let facilityUpdate;
  const historicDate = dateHelpers.formatDate(Number(dealSubmissionDate));

  if (currencyCode && currencyCode !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(currencyCode, 'GBP', historicDate);

    console.log('===========>', { currencyExchange });

    const {
      midPrice: exchangeRate,
      historicExchangeRate,
    } = currencyExchange;

    const facilityValueInGBP = value * exchangeRate;

    facilityUpdate = {
      exchangeRate: Number(exchangeRate.toFixed(2)),
      facilityValueInGBP,
      dataMigration: {
        modifiedExchangeRate: exchangeRate,
        exchangeRate: historicExchangeRate,
      },
      ...calculateUkefExposure(facilityValueInGBP, coverPercentage, dealSubmissionDate),
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
