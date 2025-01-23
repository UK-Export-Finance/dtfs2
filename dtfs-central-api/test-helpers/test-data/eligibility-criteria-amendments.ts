import { ObjectId } from 'mongodb';
import { AmendmentsEligibilityCriteria, FACILITY_TYPE, FacilityType, getEpochMs } from '@ukef/dtfs2-common';

/**
 * Instantiates an AmendmentsEligibilityCriteria object
 */
export const amendmentsEligibilityCriteria = (
  version: number = 1,
  facilityType: FacilityType[] = [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT],
  isInDraft: boolean = false,
): AmendmentsEligibilityCriteria => ({
  _id: new ObjectId(),
  version,
  facilityType,
  isInDraft,
  createdAt: getEpochMs(),
  criteria: [
    { id: 1, text: 'item 1', textList: ['item 1'] },
    { id: 2, text: 'item 2' },
  ],
});
