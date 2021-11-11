const { differenceInDays } = require('date-fns');

const calculateDrawnAmount = (facilityValue, coverPercentage) => {
  /* Business logic:
   * (Facility Amount * UKEF Cover) * 10 %) to four decimal places
  */

  const valueAndCover = (facilityValue * coverPercentage);

  const tenPercent = (valueAndCover * 10 / 100);

  const drawnAmount = (valueAndCover * tenPercent);

  // TODO: 4 decimal places
  return drawnAmount;
};

const calculateDaysOfCover = (coverStartDate, coverEndDate) => {
  /* Business logic:
   * Number of days covered.
   * I.e, date from when the cover starts until the date when the cover ends
  */

  // NOTE: if the start date is passed first, we get a minus result.
  const coverDifference = differenceInDays(
    new Date(Number(coverEndDate)),
    new Date(Number(coverStartDate)),
  );

  return coverDifference;
};

const calculateFeeAmount = (
  drawnAmount,
  daysOfCover,
  interestPercentage,
  dayBasis,
) => {
  /* Business logic:
   * (Drawn Amount * Days) * Bank’s interest margin) Divided by Days Basis
  */

  const drawnAmountAndDays = (drawnAmount * daysOfCover);

  const amountMultipliedByInterest = (drawnAmountAndDays * interestPercentage);

  const feeAmount = (amountMultipliedByInterest / dayBasis);

  return feeAmount;
};

const generateGefFacilityFeeRecord = (facility) => {
  let feeRecord;
  
  const {
    interestPercentage,
    dayCountBasis: dayBasis,
    value: facilityValue,
    coverPercentage,
    coverStartDate,
    coverEndDateTimestamp: coverEndDate,
  } = facility;

  const drawnAmount = calculateDrawnAmount(
    facilityValue,
    coverPercentage,
  );

  const daysOfCover = calculateDaysOfCover(
    coverStartDate,
    coverEndDate,
  );

  feeRecord = calculateFeeAmount(
    drawnAmount,
    daysOfCover,
    interestPercentage,
    dayBasis,
  );

  return feeRecord;
};

module.exports = {
  calculateDrawnAmount,
  calculateDaysOfCover,
  calculateFeeAmount,
  generateGefFacilityFeeRecord,
};
