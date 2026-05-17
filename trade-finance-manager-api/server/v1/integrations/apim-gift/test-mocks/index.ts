import { ObjectId } from 'bson';
import { TfmFacility, DEAL_SUBMISSION_TYPE, DEAL_TYPE, TfmDeal } from '@ukef/dtfs2-common';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';

const mockBaseDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;

const mockTfmObject = {
  parties: {
    buyer: {
      partyUrn: 'Mock party URN',
    },
  },
  exporterCreditRating: 'Acceptable (B+)',
};

export const mockTfmDeal = {
  ...mockBaseDeal,
  dealSnapshot: {
    ...mockBaseDeal.dealSnapshot,
    dealType: DEAL_TYPE.BSS_EWCS,
    submissionType: DEAL_SUBMISSION_TYPE.AIN,
  },
  tfm: mockTfmObject,
} as TfmDeal;

export const mockTfmIssuedFacility1 = {
  _id: new ObjectId('61f7a4edcf809301e78fbe53'),
  facilitySnapshot: {
    ukefFacilityId: 'FACILITY-001',
    hasBeenIssued: true,
  },
  tfm: {},
} as unknown as TfmFacility;

export const mockTfmIssuedFacility2 = {
  _id: new ObjectId('61f7a4edcf809301e78fbe54'),
  facilitySnapshot: {
    ukefFacilityId: 'FACILITY-002',
    hasBeenIssued: true,
  },
  tfm: {},
} as unknown as TfmFacility;

export const mockTfmIssuedFacility3 = {
  _id: new ObjectId('61f7a4edcf809301e78fbe55'),
  facilitySnapshot: {
    ukefFacilityId: 'FACILITY-003',
    hasBeenIssued: true,
  },
  tfm: {},
} as unknown as TfmFacility;

export const mockTfmIssuedFacility4 = {
  _id: new ObjectId('61f7a4edcf809301e78fbe56'),
  facilitySnapshot: {
    ukefFacilityId: '0030012345',
    hasBeenIssued: true,
  },
  tfm: {},
} as unknown as TfmFacility;

export const mockUnissuedFacility = {
  _id: '61f7a4edcf809301e78fbe55',
  facilitySnapshot: {
    ukefFacilityId: 'FACILITY-003',
    hasBeenIssued: false,
  },
} as unknown as TfmFacility;
