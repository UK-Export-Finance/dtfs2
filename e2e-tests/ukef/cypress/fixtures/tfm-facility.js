const { addMonths } = require('date-fns');

/**
 * There are utilisation reports in the fixtures which require an existing facility with matching
 * UKEF facility ID to test the valid upload journey.
 * The UKEF facility ID for the below facility is used in the following fixtures files:
 * - valid-utilisation-report-February_2023_monthly.xlsx
 */
export const tfmFacilityForReport = {
  facilitySnapshot: {
    ukefFacilityId: '20001371',
    value: 1000,
    coverStartDate: new Date(),
    coverEndDate: addMonths(new Date(), 5),
    interestPercentage: 5,
    dayCountBasis: 5,
    coverPercentage: 80,
  },
};
