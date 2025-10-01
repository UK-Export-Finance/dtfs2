import { add, getDaysInMonth } from 'date-fns';
import { oneMonth, twoYearsAgo } from '@ukef/dtfs2-common/test-helpers';

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
 * But in some cases for BSS facilities we add one to the difference.
 *
 * Specifically in the case of these tests, the tenor is 25 months except for:
 * - if expiry and commencement dates are the same date of month then you add one
 * - if commencement is end of month and expiry is also end of month you add one
 * - if commencement is end of month and the commencement month has less than 31 days then you do not add one`
 */
export const calculateTestFacilityTenorValue = (date) => {
  const commencementDate = twoYearsAgo(date).date;
  const expiryDate = oneMonth(date).date;

  let facilityTenor = '25 months';

  if (commencementDate.getDate() === expiryDate.getDate()) {
    facilityTenor = '26 months';
  }

  const isCommencementDateEndOfMonth = add(commencementDate, { days: 1 }).getDate() === 1;
  const isExpiryDateEndOFMonth = add(expiryDate, { days: 1 }).getDate() === 1;

  // gets number of days in commencement month
  const getDaysInMonthCommencement = getDaysInMonth(commencementDate);
  // checks if commencement month has less than 31 days
  const lessThan31DaysInCommencementMonth = getDaysInMonthCommencement < 31;

  if (isCommencementDateEndOfMonth && isExpiryDateEndOFMonth) {
    facilityTenor = '26 months';
  }

  if (isCommencementDateEndOfMonth && lessThan31DaysInCommencementMonth) {
    facilityTenor = '25 months';
  }

  return facilityTenor;
};
