import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { addMonths, subMonths } from 'date-fns';
import { Facility, UnixTimestampString } from '@ukef/dtfs2-common';

const TODAY = new Date();

const LATEST_COVER_START_DATE = subMonths(TODAY, 1);
const getRandomCoverStartDateTimestamp = (): UnixTimestampString => faker.date.past({ years: 1, refDate: LATEST_COVER_START_DATE }).getTime().toString();

const EARLIEST_COVER_END_DATE = addMonths(TODAY, 12);
const getRandomCoverEndDateTimestamp = (): UnixTimestampString => faker.date.future({ years: 2, refDate: EARLIEST_COVER_END_DATE }).getTime().toString();

export const aFacilityWithoutDealId = (): Omit<Facility, 'dealId'> => ({
  _id: new ObjectId(),
  type: 'Cash',
  hasBeenIssued: true,
  name: 'facilityName',
  shouldCoverStartOnSubmission: true,
  coverStartDate: getRandomCoverStartDateTimestamp(),
  coverEndDate: getRandomCoverEndDateTimestamp(),
  issueDate: null,
  monthsOfCover: 12,
  details: [],
  detailsOther: '',
  currency: {
    id: 'GBP',
  },
  value: 100000,
  coverPercentage: 80,
  interestPercentage: 5,
  paymentType: 'cash',
  createdAt: TODAY.getTime(),
  updatedAt: TODAY.getTime(),
  ukefExposure: 80000,
  guaranteeFee: 10,
  submittedAsIssuedDate: null,
  ukefFacilityId: '12345678',
  feeType: 'cash',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: null,
  hasBeenIssuedAndAcknowledged: null,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
});
