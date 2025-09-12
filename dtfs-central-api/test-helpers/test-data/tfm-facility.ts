import { ObjectId } from 'mongodb';
import { FacilityAmendment, TfmFacility } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { aFacility } from './facility';
import { KeyingSheetCalculationFacilityValues } from '../../server/types/tfm/tfm-facility';

export const aTfmFacility = ({
  amendments = [],
  dealId = new ObjectId(),
}: { amendments?: FacilityAmendment[]; dealId?: ObjectId | string } = {}): TfmFacility => {
  const tfmFacilityId = new ObjectId();

  return {
    _id: tfmFacilityId,
    facilitySnapshot: {
      ...aFacility(),
      _id: tfmFacilityId,
      dealId: new ObjectId(dealId),
    },
    amendments,
    tfm: {},
    auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
  };
};

export const keyingSheetCalculationFacilityValues: KeyingSheetCalculationFacilityValues = {
  coverPercentage: 80,
  value: 500000,
};
