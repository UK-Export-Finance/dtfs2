import { ObjectId } from 'mongodb';
import { DealType } from '../deal-type';
import { FacilityType } from '../facility-type';
import { AuditDatabaseRecord } from '../audit-database-record';
import { UnixTimestampMilliseconds } from '../date';

export type EligibilityCriterion = { id: number; text: string; textList: string[] };

/**
 * Type of the mongo db "eligibilityCriteriaAmendments" collection
 */
export type AmendmentsEligibilityCriteria = {
  _id: ObjectId;
  version: number;
  product: DealType;
  facilityType: FacilityType[];
  isInDraft: boolean;
  createdAt: UnixTimestampMilliseconds;
  criteria: EligibilityCriterion[];
  auditRecord?: AuditDatabaseRecord;
};
