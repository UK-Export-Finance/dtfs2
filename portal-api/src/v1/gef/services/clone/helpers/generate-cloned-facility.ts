import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { isBefore, startOfDay } from 'date-fns';
import { AuditDetails, Facility } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';

/**
 * Generate a clone of the existing facility
 * Updates/removes certain values
 * @param param0
 * @param param0.facility - the existing facility
 * @param param0.newDealId - the new deal id
 * @param param0.auditDetails - the makers audit details
 * @returns a clone of the existing facility
 */
export const generateClonedFacility = ({
  facility,
  newDealId,
  auditDetails,
}: {
  facility: Partial<Facility>;
  newDealId: string | ObjectId;
  auditDetails: AuditDetails;
}): Facility =>
  produce(facility, (draft) => {
    draft._id = new ObjectId();

    draft.dealId = new ObjectId(newDealId);
    draft.createdAt = Date.now();
    draft.updatedAt = Date.now();
    draft.ukefFacilityId = null;
    draft.canResubmitIssuedFacilities = null;
    draft.issueDate = null;
    draft.coverDateConfirmed = null;
    draft.unissuedToIssuedByMaker = {};
    draft.hasBeenIssuedAndAcknowledged = null;
    draft.submittedAsIssuedDate = null;
    draft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    draft.isUsingFacilityEndDate = null;
    draft.facilityEndDate = null;
    draft.bankReviewDate = null;

    const currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);

    // If the cover start date is in the past, it should be set to null
    if (draft.coverStartDate) {
      const coverStartDate = new Date(draft.coverStartDate);
      const startOfToday = startOfDay(new Date());

      if (isBefore(coverStartDate, startOfToday)) {
        draft.coverStartDate = null;
      }
    }
  }) as Facility;
