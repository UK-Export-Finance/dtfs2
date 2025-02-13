import { UnixTimestampMilliseconds, UnixTimestampString } from '../date';
import { FacilityType } from '../facility-type';
import { PortalFacilityStage } from './facility-stage';
import { Currency } from '../currency';
import { DealSubmissionType } from '../tfm/deal-submission-type';

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
