import { CURRENCY } from '@ukef/dtfs2-common';

import { FACILITY_PAYMENT_TYPE } from '../../../server/v1/gef/enums';

export const facilityUpdate = {
  hasBeenIssued: true,
  name: 'test',
  shouldCoverStartOnSubmission: true,
  coverStartDate: null,
  coverEndDate: '2015-01-01T00:00:00.000Z',
  monthsOfCover: 12,
  details: ['test'],
  detailsOther: null,
  currency: { id: CURRENCY.GBP },
  value: '10000000',
  coverPercentage: 80,
  interestPercentage: 40,
  paymentType: 'Monthly',
  feeType: FACILITY_PAYMENT_TYPE.IN_ADVANCE,
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: true,
  ukefFacilityId: 1234,
};
