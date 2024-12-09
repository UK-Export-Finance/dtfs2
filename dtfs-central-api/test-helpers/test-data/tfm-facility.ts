import { ObjectId } from 'mongodb';
import { FacilityAmendment, TfmFacility } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { aFacility } from './facility';
import { KeyingSheetCalculationFacilityValues } from '../../src/types/tfm/tfm-facility';

export const aTfmFacility = ({ amendments = [] }: { amendments?: FacilityAmendment[] } = {}): TfmFacility => {
  const tfmFacilityId = new ObjectId();

  return {
    _id: tfmFacilityId,
    facilitySnapshot: {
      ...aFacility(),
      _id: tfmFacilityId,
    },
    amendments,
    tfm: {},
    auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
  };
};

const { dayCountBasis, interestPercentage, coverPercentage, value } = aFacility();

export const keyingSheetCalculationFacilityValues: KeyingSheetCalculationFacilityValues = {
  coverEndDate: new Date(),
  coverStartDate: new Date(),
  dayCountBasis,
  interestPercentage,
  coverPercentage,
  value,
};
