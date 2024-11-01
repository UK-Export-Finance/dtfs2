import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { AuditDetails, Bank, getCurrentGefDealVersion, PortalSessionUser, GefDeal, AnyObject } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { DEAL } from '../../../../../constants';
import { generateClonedExporter } from './generate-cloned-exporter';

const propertiesToRemove: (keyof GefDeal)[] = [
  'ukefDecision',
  'ukefDecisionAccepted',
  'checkerMIN',
  'manualInclusionNoticeSubmissionDate',
  'comments',
  'previousStatus',
  'dataMigration',
];

/**
 * Generate a clone of the existing deal
 * Updates/removes certain values
 * @param param
 * @param params.existingDeal - the existing deal to be cloned
 * @param params.latestEligibilityCriteria - the lastest ECs
 * @param params.bankInternalRefName - the internal ref name
 * @param params.additionalRefName - the additional name
 * @param params.maker - the maker requesting the clone
 * @param params.bank - the bank the maker belongs to
 * @param params.userId - the makers id
 * @param params.dealId - the existing deal id
 * @param params.auditDetails - the makers audit details
 * @returns a clone of the deal with relevant values updated/removed
 */
export const generateClonedDeal = ({
  existingDeal,
  latestEligibilityCriteria,
  bankInternalRefName,
  additionalRefName,
  maker,
  bank,
  userId,
  dealId,
  auditDetails,
}: {
  existingDeal: GefDeal;
  latestEligibilityCriteria: AnyObject;
  bankInternalRefName: string;
  additionalRefName: string;
  maker: PortalSessionUser;
  bank: Bank;
  userId: string | ObjectId;
  dealId: string | ObjectId;
  auditDetails: AuditDetails;
}): GefDeal =>
  produce(existingDeal, (draft) => {
    propertiesToRemove.forEach((property) => {
      if (draft[property]) {
        delete draft[property];
      }
    });

    draft._id = new ObjectId();
    draft.version = getCurrentGefDealVersion();
    draft.createdAt = Date.now();
    draft.updatedAt = Date.now();
    draft.facilitiesUpdated = Date.now();
    draft.status = DEAL.DEAL_STATUS.DRAFT;
    draft.submissionCount = 0;
    draft.exporter = generateClonedExporter(draft.exporter);

    draft.eligibility = { ...latestEligibilityCriteria, updatedAt: Date.now() };
    draft.bankInternalRefName = bankInternalRefName;
    draft.additionalRefName = additionalRefName;
    draft.maker = maker;
    draft.bank = bank;
    draft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
    draft.clonedDealId = dealId;
    draft.editedBy = [userId];

    draft.submissionType = null;
    draft.submissionDate = null;
    draft.ukefDealId = null;
    draft.checkerId = null;
    draft.portalActivities = [];
    draft.supportingInformation = {};
  });
