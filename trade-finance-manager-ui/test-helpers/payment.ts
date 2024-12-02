import { CURRENCY } from '@ukef/dtfs2-common';
import { Payment } from '../server/api-response-types';

export const aPayment = (): Payment => ({
  id: 1,
  currency: CURRENCY.GBP,
  amount: 100,
  dateReceived: '2024-10-10T00:00:00.000',
  reference: undefined,
});
