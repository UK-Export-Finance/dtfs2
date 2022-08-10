const { format, fromUnixTime } = require('date-fns');
const { formattedNumber } = require('../../utils/number');
const { decimalsCount, roundNumber } = require('../../v1/helpers/number');
const { CURRENCY } = require('../../constants/currency.constant');
const api = require('../../v1/api');
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

// checks for coverStartDate and returns based on deal-type as stored differently
const dealTypeCoverStartDate = (facilitySnapshot) => {
  const { coverStartDate } = facilitySnapshot;

  // if exists - gef
  if (coverStartDate) {
    return coverStartDate;
  }

  let dateConstructed;

  if (facilitySnapshot['requestedCoverStartDate-year'] && facilitySnapshot['requestedCoverStartDate-month'] && facilitySnapshot['requestedCoverStartDate-day']) {
  // BSS stored as separate year month day values
    dateConstructed = new Date(
      facilitySnapshot['requestedCoverStartDate-year'],
      facilitySnapshot['requestedCoverStartDate-month'] - 1,
      facilitySnapshot['requestedCoverStartDate-day'],
    );
  } else {
    dateConstructed = new Date(parseInt(facilitySnapshot.requestedCoverStartDate, 10));
  }

  return dateConstructed;
};

// calculates new tenor from amendment coverEndDate and facility coverStartDate.  Requires external api call to calculate tenor
const calculateAmendmentTenor = async (facilitySnapshot, amendment) => {
  try {
    const validConditions = facilitySnapshot?.ukefFacilityType && (facilitySnapshot?.coverStartDate || facilitySnapshot?.requestedCoverStartDate)
    && amendment?.coverEndDate;

    if (validConditions) {
      const { coverEndDate } = amendment;
      const { ukefFacilityType } = facilitySnapshot;

      // returns coverStartDate from either gef or bss format
      const coverStartDate = dealTypeCoverStartDate(facilitySnapshot);
      // formatting for external api call
      const coverStartDateFormatted = format(new Date(coverStartDate), 'yyyy-MM-dd');
      const coverEndDateFormatted = format(fromUnixTime(coverEndDate), 'yyyy-MM-dd');

      const updatedTenor = await api.getFacilityExposurePeriod(coverStartDateFormatted, coverEndDateFormatted, ukefFacilityType);

      if (updatedTenor) {
        return updatedTenor.exposurePeriodInMonths;
      }
    }

    return null;
  } catch (err) {
    console.error('Error calculating amendment tenor in graphql amendment helper', { err });
    return null;
  }
};

// calculates the value for total exposure to return for a single amendment
const calculateAmendmentTotalExposure = async (facility) => {
  if (isValidFacility(facility)) {
    const { _id, tfm, facilitySnapshot } = facility;
    const { exchangeRate } = tfm;

    const latestCompletedAmendmentValue = await api.getLatestCompletedValueAmendment(_id);

    if (latestCompletedAmendmentValue?.value) {
      const { coverPercentage, coveredPercentage } = facilitySnapshot;

      // BSS is coveredPercentage while GEF is coverPercentage
      const coverPercentageValue = coverPercentage || coveredPercentage;

      const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendmentValue);
      const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

      // sets new exposure value based on amendment value
      return ukefExposureValue;
    }
  }

  return null;
};

module.exports = {
  amendmentChangeValueExportCurrency,
  calculateNewFacilityValue,
  calculateUkefExposure,
  calculateAmendmentTenor,
  calculateAmendmentTotalExposure,
};
