import { CurrencyAndAmount, IsoDateTimeStamp } from '@ukef/dtfs2-common';

export type Payment = CurrencyAndAmount & {
  id: number;
  dateReceived: IsoDateTimeStamp;
  reference?: string;
};
