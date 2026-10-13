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
    const modifiedDraft = draft;

    modifiedDraft._id = new ObjectId();

    modifiedDraft.dealId = new ObjectId(newDealId);
    modifiedDraft.createdAt = Date.now();
    modifiedDraft.updatedAt = Date.now();
    modifiedDraft.ukefFacilityId = null;
    modifiedDraft.canResubmitIssuedFacilities = null;
    modifiedDraft.issueDate = null;
    modifiedDraft.coverDateConfirmed = null;
    modifiedDraft.unissuedToIssuedByMaker = {};
    modifiedDraft.hasBeenIssuedAndAcknowledged = null;
    modifiedDraft.submittedAsIssuedDate = null;
    modifiedDraft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    modifiedDraft.isUsingFacilityEndDate = null;
    modifiedDraft.facilityEndDate = null;
    modifiedDraft.bankReviewDate = null;

    const currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);

    // If the cover start date is in the past, it should be set to null
    if (modifiedDraft.coverStartDate) {
      const coverStartDate = new Date(modifiedDraft.coverStartDate);
      const startOfToday = startOfDay(new Date());

      if (isBefore(coverStartDate, startOfToday)) {
        modifiedDraft.coverStartDate = null;
      }
    }
  }) as Facility;
