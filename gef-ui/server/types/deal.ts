import { DealStatus, DealType, IsoDateTimeStamp, AnyObject } from '@ukef/dtfs2-common';

/**
 * Deal object received from portal-api
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = {
  dealType: DealType;
  version?: number;
  maker: AnyObject;
  status: DealStatus;
  bank: AnyObject;
  exporter: AnyObject;
  bankInternalRefName: string | null;
  createdAt: IsoDateTimeStamp;
  updatedAt: IsoDateTimeStamp;
  submissionCount: number;
  supportingInformation: AnyObject;
  editedBy: string[];
  additionalRefName: string | null;
};
