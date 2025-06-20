import { GEF_FACILITY_TYPE, MOCK_TFM_FACILITY } from '@ukef/dtfs2-common';
import { DEAL_STATUS } from '../../constants';

export const mockFacility = (facilityId: string, dealId: string) => ({
  status: DEAL_STATUS.COMPLETED,
  details: {
    ...MOCK_TFM_FACILITY.facilitySnapshot,
    _id: facilityId,
    dealId,
    specialIssuePermission: null,
    type: GEF_FACILITY_TYPE.CASH,
    coverStartDate: new Date().toString(),
    coverEndDate: new Date().toString(),
    issueDate: new Date().toString(),
    details: null,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    ukefFacilityId: '00000001',
    unissuedToIssuedByMaker: undefined,
    facilityEndDate: null,
    bankReviewDate: null,
  },
});
