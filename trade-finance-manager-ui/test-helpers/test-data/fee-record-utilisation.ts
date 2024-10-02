import { CURRENCY, FeeRecordUtilisation } from '@ukef/dtfs2-common';

export const aFeeRecordUtilisation = (): FeeRecordUtilisation => ({
  feeRecordId: 3,
  facilityId: '33',
  exporter: 'Company',
  baseCurrency: CURRENCY.EUR,
  value: 300000,
  utilisation: 200000,
  coverPercentage: 85,
  exposure: 170000,
  feesAccrued: { currency: CURRENCY.EUR, amount: 300 },
  feesPayable: { currency: CURRENCY.EUR, amount: 300 },
});
