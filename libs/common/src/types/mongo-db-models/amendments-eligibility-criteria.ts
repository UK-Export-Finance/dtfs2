import { ObjectId } from 'mongodb';
import { FacilityType } from '@ukef/types/facility-type';
import { UnixTimestampMilliseconds } from '@ukef/types/date';

export type AmendmentsEligibilityCriterion = {
  id: number;
  text: string;
  textList?: string[];
};

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
