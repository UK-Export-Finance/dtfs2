import { IsoDateTimeStamp } from '@ukef/dtfs2-common';

export type ObligationSubtype = {
  id: number;
  name: number;
  description: string;
  createdAt: IsoDateTimeStamp;
  updatedAt: IsoDateTimeStamp;
  effectiveFrom: IsoDateTimeStamp;
  effectiveTo: IsoDateTimeStamp;
};
