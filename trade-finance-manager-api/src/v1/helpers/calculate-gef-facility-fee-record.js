const { differenceInDays } = require('date-fns');
const { formattedNumber } = require('../../utils/number');

// TODO: move to helpers directory?

const calculateDrawnAmount = (
  facilityValue,
  coverPercentage,
  interestPercentage,
) => {
  /* Business logic:
   * (Facility Amount * UKEF Cover) * 10 %) * bank's interest margin/percentage
  */

  const valueAndCover = (facilityValue * coverPercentage);

  return (valueAndCover * interestPercentage);
};

const calculateDaysOfCover = (coverStartDate, coverEndDate) => {
  /* Business logic:
   * Number of days covered.
   * I.e, date from when the cover starts until the date when the cover ends
  */

  // NOTE: if the start date is passed first, we get a minus result.
  return differenceInDays(
    new Date(Number(coverEndDate)),
    new Date(Number(coverStartDate)),
  );
};

const calculateFeeAmount = (
  drawnAmount,
  daysOfCover,
  dayBasis,
) => {
  /* Business logic:
   * (Drawn Amount * Days) * 10 percent
  */

  const drawnAmountAndDays = (drawnAmount * daysOfCover);

  const tenPercent = (drawnAmountAndDays * 10 / 100);

  const feeAmount = (drawnAmountAndDays * tenPercent);

  return formattedNumber(feeAmount);
};

const calculateGefFacilityFeeRecord = (facility) => {
  if (facility.hasBeenIssued) {
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
      interestPercentage,
    );

    const daysOfCover = calculateDaysOfCover(
      coverStartDate,
      coverEndDate,
    );

    feeRecord = calculateFeeAmount(
      drawnAmount,
      daysOfCover,
      dayBasis,
    );

    return feeRecord;
  }

  return null;
};

module.exports = {
  calculateDrawnAmount,
  calculateDaysOfCover,
  calculateFeeAmount,
  calculateGefFacilityFeeRecord,
};
