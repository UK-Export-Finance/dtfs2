import { UnixTimestampMilliseconds, UnixTimestampString } from '@ukef/types/date';
import { FacilityType } from '@ukef/types/facility-type';
import { Currency } from '@ukef/types/currency';
import { DealSubmissionType } from '@ukef/types/tfm/deal-submission-type';
import { PortalFacilityStage } from './facility-stage';

/**
 * Portal dashboard facilities
 */
export type FacilityDashboard = {
  _id: string;
  dealId: string;
  name: string | null;
  currency: { id: Currency } | null;
  value: number | string;
  type: FacilityType;
  submissionType?: DealSubmissionType;
  hasBeenIssued: boolean;
  updatedAt: UnixTimestampMilliseconds;
  lowerExporter: string;
  ukefFacilityId?: string;
  submittedAsIssuedDate?: UnixTimestampString | null;
  exporter?: string;
  facilityStage?: PortalFacilityStage;
};
