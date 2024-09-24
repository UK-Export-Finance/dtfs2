import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { addMonths, subMonths } from 'date-fns';
import { Facility } from '@ukef/dtfs2-common';

const TODAY = new Date();

const LATEST_COVER_START_DATE = subMonths(TODAY, 1);
const getRandomCoverStartDate = (): Date => faker.date.past({ years: 1, refDate: LATEST_COVER_START_DATE });

const EARLIEST_COVER_END_DATE = addMonths(TODAY, 12);
const getRandomCoverEndDate = (): Date => faker.date.future({ years: 2, refDate: EARLIEST_COVER_END_DATE });

/**
 * Creates a facility that can be used for utilisation reporting testing.
 * It can be replaced by creating a deal with a facility manually and then pulling from the mongo db collection.
 * This way we ensure we are inserting a valid facility.
 * @param facilityId - id for the facility
 * @param dealId - id of the deal
 * @param portalUserId - id of a portal user
 * @returns a facility
 */
export const aFacility = (facilityId: ObjectId, dealId: ObjectId, portalUserId: ObjectId): Facility => ({
  _id: facilityId,
  dealId,
  type: 'Cash',
  hasBeenIssued: true,
  name: 'TEST FOR UTILISATION REPORTING',
  shouldCoverStartOnSubmission: true,
  coverStartDate: getRandomCoverStartDate(),
  coverEndDate: getRandomCoverEndDate(),
  issueDate: null,
  monthsOfCover: null,
  details: ['Committed basis'],
  detailsOther: '',
  currency: {
    id: 'GBP',
  },
  value: 500000,
  coverPercentage: 80,
  interestPercentage: 4,
  paymentType: 'Monthly',
  createdAt: 1726060441121,
  updatedAt: 1726061294910,
  ukefExposure: 400000,
  guaranteeFee: 3.6,
  submittedAsIssuedDate: '1726061292962',
  ukefFacilityId: '0040905629',
  feeType: 'In arrears',
  feeFrequency: 'Monthly',
  dayCountBasis: 360,
  coverDateConfirmed: true,
  hasBeenIssuedAndAcknowledged: true,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
  isUsingFacilityEndDate: false,
  bankReviewDate: new Date('2028-02-29'),
  facilityEndDate: null,
  auditRecord: {
    lastUpdatedAt: '2024-09-11T13:28:19.402 +00:00',
    lastUpdatedByPortalUserId: portalUserId,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
});
