import { ObjectId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { aFacility } from './facility';

const tfmFacilityId = new ObjectId();

export const aTfmFacility = (): TfmFacility => ({
  _id: tfmFacilityId,
  facilitySnapshot: {
    ...aFacility(),
    _id: tfmFacilityId,
  },
  amendments: [],
});
