import { add } from 'date-fns';
import { oneMonth, twoYearsAgo } from '../../../e2e-fixtures/dateConstants';

/**
 * Function to calculate facility tenor for a BSS facility with a commencement date
 * two years ago and an expiry date one month from today.
 *
 * Various tests involve a BSS deal with a facility that has a commencement
 * date two years ago today and an expiry date one month from today.
 *
 * The tenor is calculated by MDM using a SQL function.
 *
 * The tenor is the difference in months between the expiry date and the commencement date.
 * But in some cases we add one.
 *
 * Specifically in the case of these tests, the tenor is 25 months except for:
 * - if expiry and commencement dates are the same date of month then you add one
 * - if commencement is end of month and expiry is also end of month you add one
 */
const calculateFacilityTenorForBssFacilityWithCommencementDateTwoYearsAgoAndExpiryDateOneMonthFromToday = () => {
  let facilityTenor = '25 months';

  if (twoYearsAgo.date.getDate() === oneMonth.date.getDate()) {
    facilityTenor = '26 months';
  }

  const isCommencementDateEndOfMonth = add(twoYearsAgo.date, { days: 1 }).getDate() === 1;
  const isExpiryDateEndOFMonth = add(oneMonth.date, { days: 1 }).getDate() === 1;

  if (isCommencementDateEndOfMonth && isExpiryDateEndOFMonth) {
    facilityTenor = '26 months';
  }

  return facilityTenor;
};

export const FACILITY_TENOR = {
  BSS: {
    COMMENCEMENT_TWO_YEARS_AGO_EXPIRY_IN_ONE_MONTH: calculateFacilityTenorForBssFacilityWithCommencementDateTwoYearsAgoAndExpiryDateOneMonthFromToday(),
  },
};
