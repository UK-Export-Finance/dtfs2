import { ObjectId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { aFacility } from './facility';

const facility = aFacility();

export const aTfmFacility = (): TfmFacility => {
  const tfmFacilityId = new ObjectId();

  return {
    _id: tfmFacilityId,
    facilitySnapshot: {
      ...facility,
      _id: tfmFacilityId,
    },
    amendments: [],
    tfm: {},
    auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
  };
};

export const keyingSheetCalculationTfmFacilityValues = {
  coverEndDate: new Date(),
  coverStartDate: new Date(),
  dayCountBasis: facility.dayCountBasis,
  interestPercentage: facility.interestPercentage,
  coverPercentage: facility.coverPercentage,
  value: facility.value,
};
