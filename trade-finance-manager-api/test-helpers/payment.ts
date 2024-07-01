import { Payment } from '../src/v1/api-response-types';

export const aPayment = (): Payment => ({
  id: 1,
  currency: 'GBP',
  amount: 100,
  dateReceived: '2024-01-01T00:00:00.000',
  reference: 'A payment reference',
});
