import { ObjectId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { aFacility } from './facility';

export const aTfmFacility = (): TfmFacility => {
  const tfmFacilityId = new ObjectId();

  return {
    _id: tfmFacilityId,
    facilitySnapshot: {
      ...aFacility(),
      _id: tfmFacilityId,
    },
    amendments: [],
  };
};
