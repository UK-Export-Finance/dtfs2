import { DealType, IsoDateTimeStamp } from '@ukef/dtfs2-common';

/**
 * Deal object received from portal-api
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = {
  dealType: DealType;
  version?: number;
  maker: Record<string, unknown>;
  status: string; // TODO: Use type once updated with main
  bank: Record<string, unknown>;
  exporter: Record<string, unknown>;
  bankInternalRefName: string | null;
  createdAt: IsoDateTimeStamp;
  updatedAt: IsoDateTimeStamp;
  submissionCount: number;
  supportingInformation: Record<string, unknown>;
  editedBy: string[];
  additionalRefName: string | null;
};
