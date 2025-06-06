const { calculateDrawnAmount } = require('@ukef/dtfs2-common');

const { differenceInDays } = require('date-fns');

/* Business logic:
 * Number of days covered.
 * I.e, date from when the cover starts until the date when the cover ends
 * Logic has been updated based on feedback from Mulesoft team (AV) - 10/02/2022
 */

// NOTE: if the start date is passed first, we get a minus result.
const calculateDaysOfCover = (coverStartDate, coverEndDate) => differenceInDays(new Date(Number(coverEndDate)), new Date(Number(coverStartDate)));

/* Business logic:
 * (Drawn Amount * Days Of Cover * Interest rate) / day basis
 * Logic has been updated based on feedback from Mulesoft team (AV) - 10/02/2022
 */
const calculateFeeAmount = (drawnAmount, daysOfCover, dayBasis, interestPercentage) => (drawnAmount * daysOfCover * (interestPercentage / 100)) / dayBasis;

const calculateGefFacilityFeeRecord = (facility) => {
  if (facility.hasBeenIssued) {
    const { interestPercentage, dayCountBasis: dayBasis, value, coverPercentage, coverStartDate, coverEndDateTimestamp: coverEndDate, type } = facility;

    const drawnAmount = calculateDrawnAmount(value, coverPercentage, type);
    const daysOfCover = calculateDaysOfCover(coverStartDate, coverEndDate);
    const feeRecord = calculateFeeAmount(drawnAmount, daysOfCover, dayBasis, interestPercentage);

    return feeRecord;
  }

  return null;
};

module.exports = {
  calculateDaysOfCover,
  calculateFeeAmount,
  calculateGefFacilityFeeRecord,
};
