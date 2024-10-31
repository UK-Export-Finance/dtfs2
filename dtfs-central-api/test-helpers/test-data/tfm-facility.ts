import { ObjectId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { aFacility } from './facility';
import { KeyingSheetCalculationFacilityValues } from '../../src/types/tfm/tfm-facility';

const facility = aFacility();
const { dayCountBasis, interestPercentage, coverPercentage, value } = facility;

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

export const keyingSheetCalculationFacilityValues = {
  coverEndDate: new Date(),
  coverStartDate: new Date(),
  dayCountBasis,
  interestPercentage,
  coverPercentage,
  value,
} as KeyingSheetCalculationFacilityValues;
