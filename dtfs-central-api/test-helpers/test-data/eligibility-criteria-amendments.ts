import { ObjectId } from 'mongodb';
import { AmendmentsEligibilityCriteria, DEAL_TYPE, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';

/**
 * Instantiates an AmendmentsEligibilityCriteria object
 */
export const amendmentsEligibilityCriteria = (): AmendmentsEligibilityCriteria => ({
  _id: new ObjectId(),
  version: 1,
  product: DEAL_TYPE.GEF,
  facilityType: [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT],
  isInDraft: false,
  createdAt: new Date().getTime(),
  criteria: [
    { id: 1, text: 'item 1', textList: ['item 1'] },
    { id: 2, text: 'item 2' },
  ],
  auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
});
