import { ObjectId } from 'mongodb';
import { TfmFacilityAmendment } from '@ukef/dtfs2-common';

export const aTfmFacilityAmendment = (): TfmFacilityAmendment => ({
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  status: 'In progress',
  version: 0,
});
