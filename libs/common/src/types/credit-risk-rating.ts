import { IsoDateTimeStamp } from './date';

export type CreditRiskRating = {
  id: number;
  name: number;
  description: string;
  createdAt: IsoDateTimeStamp;
  updatedAt: IsoDateTimeStamp;
  effectiveFrom: IsoDateTimeStamp;
  effectiveTo: IsoDateTimeStamp;
};
