import { CurrencyAndAmount } from '@ukef/dtfs2-common';

export type Payment = CurrencyAndAmount & {
  id: number;
  dateReceived: Date;
  reference?: string;
};
