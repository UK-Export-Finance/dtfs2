import { Facility, FACILITY_TYPE, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

export const MOCK_FACILITY_SNAPSHOT: Facility = {
  _id: new ObjectId(),
  dealId: new ObjectId(),
  type: FACILITY_TYPE.CASH,
  hasBeenIssued: true,
  name: 'Test Facility',
  shouldCoverStartOnSubmission: true,
  coverStartDate: new Date('2021-01-01'),
  coverEndDate: new Date('2023-01-01'),
  issueDate: null,
  monthsOfCover: null,
  details: ['Revolving or renewing basis'],
  detailsOther: '',
  currency: {
    id: 'GBP',
  },
  value: 50000,
  coverPercentage: 10,
  interestPercentage: 5,
  paymentType: 'Quarterly',
  createdAt: 1718728159228,
  updatedAt: 1718728346991,
  ukefExposure: 5000,
  guaranteeFee: 4.5,
  submittedAsIssuedDate: '1718728345615',
  ukefFacilityId: '0040769518',
  feeType: 'At maturity',
  feeFrequency: 'Monthly',
  dayCountBasis: 360,
  coverDateConfirmed: true,
  hasBeenIssuedAndAcknowledged: null,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
};

export const MOCK_AMENDMENT: TfmFacilityAmendment = {
  version: 1,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: 1723653619,
  updatedAt: 1723653634,
  status: 'Completed',
  tfm: {
    amendmentExposurePeriodInMonths: null,
    coverEndDate: 1794418807,
    exposure: {
      exposure: '0.50',
      timestamp: 1828546829000,
      ukefExposureValue: 0.5,
    },
    value: {
      currency: 'GBP',
      value: 5,
    },
  },
};
