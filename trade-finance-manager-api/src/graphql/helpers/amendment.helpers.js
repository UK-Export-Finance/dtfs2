const { formattedNumber } = require('../../utils/number');
const { decimalsCount, roundNumber } = require('../../v1/helpers/number');
const { CURRENCY } = require('../../constants/currency.constant');
const isValidFacility = require('./isValidFacility.helper');

// returns the formatted amendment value and currency (without conversion)
const amendmentChangeValueExportCurrency = (amendment) => {
  const { currency, value: amendmentValue } = amendment;

  if (currency && amendmentValue) {
    return `${currency} ${formattedNumber(amendmentValue)}`;
  }

  return null;
};

const roundValue = (valueInGBP) => {
  const totalDecimals = decimalsCount(valueInGBP);

  // rounds to 2 decimal palces if decimals greater than 2
  const newValue = totalDecimals > 2 ? roundNumber(valueInGBP, 2) : valueInGBP;

  return newValue;
};

// calculates new facility value in GBP
const calculateNewFacilityValue = (exchangeRate, amendment) => {
  const { currency, value: amendmentValue } = amendment;
  let newValue;

  if (currency && amendmentValue) {
    // if already in GBP, just take the value
    if (currency === CURRENCY.GBP) {
      newValue = amendmentValue;
    } else {
      // if no exchange rate return null
      if (!exchangeRate) {
        return null;
      }
      const valueInGBP = amendmentValue * exchangeRate;
      newValue = roundValue(valueInGBP);
    }

    return newValue;
  }

  return null;
};

// calculates new ukef exposure from amendment value
const calculateUkefExposure = (facilityValueInGBP, coverPercentage) => {
  if (facilityValueInGBP && coverPercentage) {
    // parse float as can have 2 decimal places in facility value
    const calculation = parseFloat(facilityValueInGBP, 10) * (coverPercentage / 100);
    const totalDecimals = decimalsCount(calculation);

    const ukefExposure = totalDecimals > 2 ? roundNumber(calculation, 2) : calculation;

    return ukefExposure;
  }

  return null;
};

// returns tfm object from latest amendment if it exists or null
const findLatestCompletedAmendment = (amendments) => {
  if (!amendments.length) {
    return null;
  }
  // array reversed to get the latest amendment
  const amendmentsReversed = [...amendments].reverse();
  // reversed array checked for first tfm object and is returned
  const tfmAmendmentObject = amendmentsReversed.find((amendment) => amendment.tfm);

  if (tfmAmendmentObject) {
    return tfmAmendmentObject.tfm;
  }

  return null;
};

// calculates the value for total exposure to return for a single amendment
const calculateAmendmentTotalExposure = (facility) => {
  if (isValidFacility(facility)) {
    const { tfm, facilitySnapshot } = facility;
    const { exchangeRate } = tfm;

    if (facility?.amendments?.length) {
      const { coverPercentage, coveredPercentage } = facilitySnapshot;
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

      // BSS is coveredPercentage while GEF is coverPercentage
      const coverPercentageValue = coverPercentage || coveredPercentage;

      if (latestAmendmentTFM?.value) {
        const valueInGBP = calculateNewFacilityValue(exchangeRate, latestAmendmentTFM.value);
        const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

        // sets new exposure value based on amendment value
        return ukefExposureValue;
      }
    }
  }

  return null;
};

module.exports = {
  amendmentChangeValueExportCurrency,
  calculateNewFacilityValue,
  calculateUkefExposure,
  calculateAmendmentTotalExposure,
  findLatestCompletedAmendment,
};
