import { ObjectId } from 'mongodb';
import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';

export const aTfmFacilityAmendment = (): TfmFacilityAmendment => ({
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  status: AMENDMENT_STATUS.IN_PROGRESS,
  version: 0,
});

export const aCompletedTfmFacilityAmendment = (): TfmFacilityAmendment => ({
  ...aTfmFacilityAmendment(),
  status: AMENDMENT_STATUS.COMPLETED,
});
