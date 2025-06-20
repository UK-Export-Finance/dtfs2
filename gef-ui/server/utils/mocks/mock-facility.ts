import { GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { TFM_FACILITY } from './mock-tfm-facility';
import { DEAL_STATUS } from '../../constants';

export const mockFacility = (facilityId: string, dealId: string) => ({
  status: DEAL_STATUS.COMPLETED,
  details: {
    ...TFM_FACILITY.facilitySnapshot,
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
