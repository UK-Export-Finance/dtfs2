import { ObjectId } from 'mongodb';
import { FacilityType } from '../facility-type';
import { UnixTimestampMilliseconds } from '../date';

export type AmendmentsEligibilityCriterion = { id: number; text: string; textList?: string[] };

/**
 * Type of the mongo db "eligibilityCriteriaAmendments" collection
 */
export type AmendmentsEligibilityCriteria = {
  _id: ObjectId;
  version: number;
  facilityType: FacilityType[];
  isInDraft: boolean;
  createdAt: UnixTimestampMilliseconds;
  criteria: AmendmentsEligibilityCriterion[];
};
