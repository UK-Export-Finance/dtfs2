import { ObjectId } from 'mongodb';
import { TFM_AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';

export const aTfmFacilityAmendment = (): TfmFacilityAmendment => ({
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
  version: 0,
});

export const aCompletedTfmFacilityAmendment = (): TfmFacilityAmendment => ({
  ...aTfmFacilityAmendment(),
  status: TFM_AMENDMENT_STATUS.COMPLETED,
});
