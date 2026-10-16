import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { AuditDetails, Bank, getCurrentGefDealVersion, PortalSessionUser, GefDeal, AnyObject } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { DEAL } from '../../../../../constants';
import { generateClonedExporter } from './generate-cloned-exporter';

export const propertiesToRemove: (keyof GefDeal)[] = [
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
    const modifiedDraft = draft;

    propertiesToRemove.forEach((property) => {
      if (modifiedDraft[property]) {
        delete modifiedDraft[property];
      }
    });

    modifiedDraft._id = new ObjectId();
    modifiedDraft.version = getCurrentGefDealVersion();
    modifiedDraft.createdAt = Date.now();
    modifiedDraft.updatedAt = Date.now();
    modifiedDraft.facilitiesUpdated = Date.now();
    modifiedDraft.status = DEAL.DEAL_STATUS.DRAFT;
    modifiedDraft.submissionCount = 0;
    modifiedDraft.exporter = generateClonedExporter(modifiedDraft.exporter);

    modifiedDraft.eligibility = { ...latestEligibilityCriteria, updatedAt: Date.now() };
    modifiedDraft.bankInternalRefName = bankInternalRefName;
    modifiedDraft.additionalRefName = additionalRefName;
    modifiedDraft.maker = maker;
    modifiedDraft.bank = bank;
    modifiedDraft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
    modifiedDraft.clonedDealId = dealId;
    modifiedDraft.editedBy = [userId];

    modifiedDraft.submissionType = null;
    modifiedDraft.submissionDate = null;
    modifiedDraft.ukefDealId = null;
    modifiedDraft.checkerId = null;
    modifiedDraft.portalActivities = [];
    modifiedDraft.supportingInformation = {};
  });
