import { ObjectId } from 'mongodb';
import { Facility, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { aFacility } from '../../../test-helpers';

export const mockFacilities: Facility[] = [
  {
    ...aFacility(),
    type: FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: false,
  },
  {
    ...aFacility(),
    type: FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: null,
  },
  {
    ...aFacility(),
    type: FACILITY_TYPE.CASH,
    hasBeenIssued: false,
    shouldCoverStartOnSubmission: false,
  },
  {
    ...aFacility(),
    type: FACILITY_TYPE.CONTINGENT,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: false,
  },
  {
    ...aFacility(),
    type: FACILITY_TYPE.CONTINGENT,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: true,
    issueDate: '2021-12-01T12:32:00.000+00:00',
    ukefFacilityId: '1234567890',
    unissuedToIssuedByMaker: {
      firstname: 'Mister',
      surname: 'One',
      _id: '61e567d7db41bd65b00bd47a',
    },
  },
  {
    ...aFacility(),
    type: FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: true,
    issueDate: '2021-12-01T12:32:00.000+00:00',
    ukefFacilityId: '321',
    unissuedToIssuedByMaker: {
      firstname: 'Mister',
      surname: 'Two',
      _id: '61e567d7db41bd65b00bd47b',
    },
  },
];

export const facilityWithDealId = (dealId: string | ObjectId) => ({
  status: 'In progress',
  items: [
    {
      status: 'In progress',
      details: {
        ...aFacility(),
        dealId,
        type: FACILITY_TYPE.CONTINGENT,
        hasBeenIssued: true,
        shouldCoverStartOnSubmission: true,
        canResubmitIssuedFacilities: true,
        issueDate: '2021-12-01T12:32:00.000+00:00',
        ukefFacilityId: '1234567890',
        unissuedToIssuedByMaker: {
          firstname: 'Mister',
          surname: 'One',
          _id: '61e567d7db41bd65b00bd47a',
        },
      },
    },
  ],
});
