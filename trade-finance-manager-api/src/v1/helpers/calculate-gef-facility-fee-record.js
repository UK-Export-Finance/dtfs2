const { differenceInDays } = require('date-fns');

const calculateDrawnAmount = (
  facilityValue,
  coverPercentage,
  interestPercentage,
) => {
  /* Business logic:
   * (Facility Amount * UKEF Cover (fractional percentage)) * bank's interest margin/percentage
  */

  const fractionalCoverPercentage = `0.${coverPercentage}`;
  const valueAndCover = (facilityValue * fractionalCoverPercentage);

  return (valueAndCover * interestPercentage);
};

const calculateDaysOfCover = (
  coverStartDate,
  coverEndDate,
) =>
/* Business logic:
 * Number of days covered.
 * I.e, date from when the cover starts until the date when the cover ends
 */

  // NOTE: if the start date is passed first, we get a minus result.
  differenceInDays(
    new Date(Number(coverEndDate)),
    new Date(Number(coverStartDate)),
  );

const calculateFeeAmount = (
  drawnAmount,
  daysOfCover,
  dayBasis,
) =>
  /* Business logic:
   * (Drawn Amount * Days Of Cover) * 10 percent, divided by day basis
  */
  (drawnAmount * daysOfCover * (0.1 / dayBasis));

const calculateGefFacilityFeeRecord = (facility) => {
  if (facility.hasBeenIssued) {
    const {
      interestPercentage,
      dayCountBasis: dayBasis,
      value,
      coverPercentage,
      coverStartDate,
      coverEndDateTimestamp: coverEndDate,
    } = facility;

    const drawnAmount = calculateDrawnAmount(
      value,
      coverPercentage,
      interestPercentage,
    );

    const daysOfCover = calculateDaysOfCover(
      coverStartDate,
      coverEndDate,
    );

    const feeRecord = calculateFeeAmount(
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
