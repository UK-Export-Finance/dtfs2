import { add, differenceInMonths } from 'date-fns';
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
 * - if commencement is end of month and expiry is also end of month you add one
 */
export const calculateTestFacilityTenorValue = () => {
  const difference = differenceInMonths(oneMonth.date, twoYearsAgo.date).toString();
  let facilityTenor = `${difference} months`;

  const isCommencementDateEndOfMonth = add(twoYearsAgo.date, { days: 1 }).getDate() === 1;
  const isExpiryDateEndOFMonth = add(oneMonth.date, { days: 1 }).getDate() === 1;

  if (isCommencementDateEndOfMonth && isExpiryDateEndOFMonth) {
    facilityTenor = '26 months';
  }

  return facilityTenor;
};
